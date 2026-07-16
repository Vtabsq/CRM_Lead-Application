"""
Structured Logging Module for CRM Lead Application
Provides JSON-formatted logging with PII redaction.
"""

import logging
import re
import json
import sys
from datetime import datetime, timezone
from typing import Optional


# --- PII Redaction Patterns ---

PII_PATTERNS = [
    # Email addresses
    (re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"), "[EMAIL_REDACTED]"),
    # Phone numbers (10+ digits, with optional separators)
    (re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,}"), "[PHONE_REDACTED]"),
    # Aadhaar numbers (12 digits with optional spaces/dashes)
    (re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"), "[AADHAAR_REDACTED]"),
    # Password field values in JSON-like strings
    (re.compile(r'(?i)("?password"?\s*[:=]\s*)"[^"]*"'), r'\1"[REDACTED]"'),
    (re.compile(r"(?i)('?password'?\s*[:=]\s*)'[^']*'"), r"\1'[REDACTED]'"),
]


def redact_pii(message: str) -> str:
    """Redact PII from a log message."""
    if not isinstance(message, str):
        message = str(message)
    for pattern, replacement in PII_PATTERNS:
        message = pattern.sub(replacement, message)
    return message


# --- Structured JSON Formatter ---

class StructuredFormatter(logging.Formatter):
    """Format log records as JSON with timestamp, level, message, and extras."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": redact_pii(record.getMessage()),
        }

        # Add extra fields if present
        for key in ("user", "ip", "action", "event_type", "path", "method", "status_code"):
            if hasattr(record, key):
                log_entry[key] = getattr(record, key)

        # Add exception info if present
        if record.exc_info and record.exc_info[1]:
            log_entry["exception"] = redact_pii(str(record.exc_info[1]))

        return json.dumps(log_entry, default=str)


# --- Logger Setup ---

def setup_logger(name: str = "crm", level: str = "INFO") -> logging.Logger:
    """
    Create and configure a structured logger.
    Returns a logger instance with JSON formatting and PII redaction.
    """
    logger = logging.getLogger(name)

    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Console handler with structured formatter
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    logger.addHandler(handler)

    # Prevent propagation to root logger (avoids duplicate output)
    logger.propagate = False

    return logger


# --- Convenience Functions ---

# Global logger instance
logger = setup_logger("crm")


def log_security_event(
    event_type: str,
    user: Optional[str] = None,
    ip: Optional[str] = None,
    details: Optional[str] = None,
    level: str = "warning",
):
    """
    Log a security-relevant event.
    
    Args:
        event_type: Type of event (e.g., "login_failed", "login_success", "unauthorized_access")
        user: Username involved (will be included in log, not redacted)
        ip: Client IP address
        details: Additional details
        level: Log level (info, warning, error)
    """
    extra = {
        "event_type": event_type,
    }
    if user:
        extra["user"] = user
    if ip:
        extra["ip"] = ip

    message = f"Security event: {event_type}"
    if details:
        message += f" - {redact_pii(details)}"

    log_func = getattr(logger, level, logger.warning)
    log_func(message, extra=extra)


def log_request(method: str, path: str, status_code: int, ip: str = "", user: str = ""):
    """Log an API request."""
    logger.info(
        f"{method} {path} -> {status_code}",
        extra={
            "method": method,
            "path": path,
            "status_code": status_code,
            "ip": ip,
            "user": user,
        },
    )
