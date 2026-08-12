"""
FastAPI Dependency Providers.
Manages singletons and lifecycle for Engine, Storages, and Configuration.
"""

from functools import lru_cache
from typing import Optional
from virality_lab.config.app_config import AppConfig
from virality_lab.engine.virality_lab_engine import ViralityLabEngine
from virality_lab.storage.cache import AnalysisCache, MemoryAnalysisCache
from virality_lab.storage.media import LocalMediaStorage, MediaStorage
from virality_lab.storage.runs import MemoryRunStore, RunStore

# Application-level singletons
_app_config: Optional[AppConfig] = None
_media_storage: Optional[MediaStorage] = None
_run_store: Optional[RunStore] = None
_cache: Optional[AnalysisCache] = None
_engine: Optional[ViralityLabEngine] = None


@lru_cache()
def get_app_config() -> AppConfig:
    """Get or load centralized AppConfig."""
    global _app_config
    if _app_config is None:
        _app_config = AppConfig.from_env()
    return _app_config


def get_media_storage() -> MediaStorage:
    """Get media storage instance."""
    global _media_storage
    if _media_storage is None:
        config = get_app_config()
        _media_storage = LocalMediaStorage(config=config)
    return _media_storage


def get_run_store() -> RunStore:
    """Get job & run store instance."""
    global _run_store
    if _run_store is None:
        _run_store = MemoryRunStore()
    return _run_store


def get_analysis_cache() -> AnalysisCache:
    """Get analysis cache instance."""
    global _cache
    if _cache is None:
        _cache = MemoryAnalysisCache()
    return _cache


def get_engine() -> ViralityLabEngine:
    """Get ViralityLabEngine facade instance."""
    global _engine
    if _engine is None:
        config = get_app_config()
        run_store = get_run_store()
        cache = get_analysis_cache()
        _engine = ViralityLabEngine(config=config, run_store=run_store, cache=cache)
    return _engine


def reset_dependencies() -> None:
    """Reset singletons (useful for test isolation)."""
    global _app_config, _media_storage, _run_store, _cache, _engine
    _app_config = None
    _media_storage = None
    _run_store = None
    _cache = None
    _engine = None
