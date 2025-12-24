"""
Simple in-memory cache for dashboard data
Reduces Google Sheets API calls to avoid quota limits
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class DashboardCache:
    def __init__(self, ttl_minutes: int = 5):
        """
        Initialize cache with time-to-live in minutes
        
        Args:
            ttl_minutes: How long to keep cached data (default: 5 minutes)
        """
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_minutes = ttl_minutes
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get cached data if it exists and is not expired
        
        Args:
            key: Cache key
            
        Returns:
            Cached data or None if expired/not found
        """
        if key not in self.cache:
            return None
        
        cached_item = self.cache[key]
        expiry_time = cached_item['expiry']
        
        # Check if cache is expired
        if datetime.now() > expiry_time:
            del self.cache[key]
            return None
        
        return cached_item['data']
    
    def set(self, key: str, data: Dict[str, Any]) -> None:
        """
        Store data in cache with expiry time
        
        Args:
            key: Cache key
            data: Data to cache
        """
        expiry_time = datetime.now() + timedelta(minutes=self.ttl_minutes)
        self.cache[key] = {
            'data': data,
            'expiry': expiry_time
        }
    
    def clear(self) -> None:
        """Clear all cached data"""
        self.cache.clear()
    
    def clear_expired(self) -> None:
        """Remove expired cache entries"""
        now = datetime.now()
        expired_keys = [
            key for key, value in self.cache.items()
            if now > value['expiry']
        ]
        for key in expired_keys:
            del self.cache[key]


# Global cache instance (5-minute TTL)
dashboard_cache = DashboardCache(ttl_minutes=5)
