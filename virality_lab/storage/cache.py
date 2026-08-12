"""
Analysis & Simulation Result Cache.
Provides an abstraction to cache expensive ContentProfiles and simulation outputs.
"""

from abc import ABC, abstractmethod
import threading
import time
from typing import Any, Dict, Optional, Tuple


class AnalysisCache(ABC):
    """Abstract cache for expensive content analysis and simulation artifacts."""

    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """Retrieve cached item if not expired."""
        pass

    @abstractmethod
    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> None:
        """Store item with TTL."""
        pass

    @abstractmethod
    def delete(self, key: str) -> bool:
        """Delete item by key."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clear entire cache."""
        pass


class MemoryAnalysisCache(AnalysisCache):
    """Thread-safe in-memory cache with TTL support."""

    def __init__(self) -> None:
        self._store: Dict[str, Tuple[Any, float]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._store:
                return None
            val, expiry = self._store[key]
            if time.time() > expiry:
                del self._store[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> None:
        with self._lock:
            expiry = time.time() + ttl_seconds
            self._store[key] = (value, expiry)

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._store:
                del self._store[key]
                return True
            return False

    def clear(self) -> None:
        with self._lock:
            self._store.clear()
