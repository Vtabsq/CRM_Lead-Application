"""
Rate Limiter Middleware for FastAPI
Simple in-memory per-IP rate limiting with no external dependencies.
"""

import os
import time
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

_ALLOWED_ORIGINS = set(
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://localhost:5174",
    ).split(",")
    if o.strip()
)


def _cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin", "")
    if origin in _ALLOWED_ORIGINS:
        return {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"}
    return {}


class RateLimiter:
    """
    In-memory rate limiter that tracks requests per IP address.
    Uses a sliding window approach.
    """

    def __init__(self, default_limit: int = 100, window_seconds: int = 60):
        """
        Args:
            default_limit: Maximum requests per window per IP
            window_seconds: Time window in seconds
        """
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        # {ip: [(timestamp, path), ...]}
        self._requests: Dict[str, list] = defaultdict(list)
        # Path-specific rate limits: {path_prefix: (limit, window)}
        self._path_limits: Dict[str, Tuple[int, int]] = {}

    def add_path_limit(self, path: str, limit: int, window_seconds: int = 60):
        """Add a rate limit for a specific path prefix."""
        self._path_limits[path] = (limit, window_seconds)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, handling proxies."""
        # Check X-Forwarded-For header (set by reverse proxies like Render, Nginx)
        forwarded = request.headers.get("X-Forwarded-For", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        # Check X-Real-IP header
        real_ip = request.headers.get("X-Real-IP", "")
        if real_ip:
            return real_ip.strip()
        # Fall back to direct client IP
        if request.client:
            return request.client.host
        return "unknown"

    def _cleanup_old_requests(self, ip: str, window: int):
        """Remove expired entries for an IP."""
        cutoff = time.time() - window
        self._requests[ip] = [
            (ts, path) for ts, path in self._requests[ip] if ts > cutoff
        ]

    def is_rate_limited(self, request: Request) -> Tuple[bool, int, int]:
        """
        Check if a request should be rate limited.
        Returns (is_limited, limit, remaining).
        """
        ip = self._get_client_ip(request)
        path = request.url.path.rstrip("/") or "/"
        now = time.time()

        # Find applicable path-specific limit
        limit = self.default_limit
        window = self.window_seconds
        matched_path_limit = False
        for path_prefix, (path_limit, path_window) in self._path_limits.items():
            if path.startswith(path_prefix):
                limit = path_limit
                window = path_window
                matched_path_limit = True
                break

        # Cleanup old entries
        self._cleanup_old_requests(ip, window)

        # Count requests in window for this path pattern
        if matched_path_limit:
            # Count only requests to this specific path
            count = sum(1 for ts, p in self._requests[ip] if p == path and ts > now - window)
        else:
            # Count all requests for general rate limit
            count = len(self._requests[ip])

        # Record this request
        self._requests[ip].append((now, path))

        remaining = max(0, limit - count - 1)
        is_limited = count >= limit

        return is_limited, limit, remaining


# Global rate limiter instance
rate_limiter = RateLimiter(default_limit=100, window_seconds=60)

# Stricter limits for sensitive endpoints
rate_limiter.add_path_limit("/login", limit=10, window_seconds=60)
rate_limiter.add_path_limit("/test_email", limit=5, window_seconds=60)
rate_limiter.add_path_limit("/upload_file", limit=20, window_seconds=60)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware that applies rate limiting."""

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for OPTIONS (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        is_limited, limit, remaining = rate_limiter.is_rate_limited(request)

        if is_limited:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please try again later."},
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    **_cors_headers(request),
                },
            )

        response = await call_next(request)

        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response

