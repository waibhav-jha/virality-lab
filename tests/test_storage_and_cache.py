"""
Tests for MediaStorage, RunStore, and AnalysisCache abstractions.
"""

import time
from virality_lab.config.app_config import AppConfig
from virality_lab.storage.cache import MemoryAnalysisCache
from virality_lab.storage.media import LocalMediaStorage
from virality_lab.storage.runs import JobStatus, MemoryRunStore, PipelineStage


def test_memory_analysis_cache_ttl_and_eviction():
    """Verify MemoryAnalysisCache handles set, get, TTL expiration, and clear."""
    cache = MemoryAnalysisCache()

    # 1. Set and get
    cache.set("profile_1", {"word_count": 100}, ttl_seconds=1)
    assert cache.get("profile_1") == {"word_count": 100}

    # 2. Key deletion
    cache.set("profile_2", {"word_count": 50}, ttl_seconds=60)
    assert cache.delete("profile_2") is True
    assert cache.get("profile_2") is None
    assert cache.delete("nonexistent") is False

    # 3. Expiration
    time.sleep(1.1)
    assert cache.get("profile_1") is None

    # 4. Clear
    cache.set("profile_3", {"word_count": 20}, ttl_seconds=60)
    cache.clear()
    assert cache.get("profile_3") is None


def test_memory_run_store_lifecycle():
    """Verify MemoryRunStore handles job creation, updates, listing, and deletion."""
    store = MemoryRunStore()

    # 1. Create job
    job = store.create_job(run_id="vl_20260812_test01", request_data={"platform": "tiktok"})
    assert job.run_id == "vl_20260812_test01"
    assert job.status == JobStatus.QUEUED
    assert job.stage == PipelineStage.QUEUED
    assert job.progress == 0

    # 2. Update job
    updated = store.update_job(
        run_id="vl_20260812_test01",
        status=JobStatus.PROCESSING,
        stage=PipelineStage.ANALYZING,
        progress=25,
        message="Analyzing text features",
    )
    assert updated is not None
    assert updated.status == JobStatus.PROCESSING
    assert updated.stage == PipelineStage.ANALYZING
    assert updated.progress == 25

    # 3. Get job
    retrieved = store.get_job("vl_20260812_test01")
    assert retrieved.progress == 25

    # 4. List jobs
    store.create_job(run_id="vl_20260812_test02")
    jobs = store.list_jobs(limit=10)
    assert len(jobs) == 2

    # 5. Delete job
    assert store.delete_job("vl_20260812_test01") is True
    assert store.get_job("vl_20260812_test01") is None
    assert store.delete_job("vl_20260812_test01") is False


def test_local_media_storage_lifecycle_and_cleanup(tmp_path):
    """Verify LocalMediaStorage saves, reads, deletes, and cleans up expired files."""
    config = AppConfig(media_storage_dir=tmp_path)
    storage = LocalMediaStorage(config=config)

    content = b"fake video content header"
    file_path = storage.save(filename="sample.mp4", content=content, content_type="video/mp4")
    assert storage.get(file_path) == content

    # Delete
    assert storage.delete(file_path) is True
    assert storage.get(file_path) is None
    assert storage.delete(file_path) is False

    # Cleanup check
    p1 = storage.save(filename="temp1.jpg", content=b"\xFF\xD8\xFFdummy", content_type="image/jpeg")
    time.sleep(0.1)
    cleaned = storage.cleanup(max_age_seconds=0)
    assert cleaned >= 1
