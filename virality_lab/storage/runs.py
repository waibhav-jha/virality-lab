"""
Run & Job State Storage.
Tracks asynchronous and synchronous Virality Lab execution jobs,
stage progress, status updates, and execution payloads.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from enum import Enum
import threading
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Lifecycle status of a Virality Lab run."""

    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PipelineStage(str, Enum):
    """Granular execution stage within the end-to-end pipeline."""

    QUEUED = "queued"
    UPLOADING = "uploading"
    ANALYZING = "analyzing"
    EXTRACTING_MEDIA = "extracting_media"
    BUILDING_PROFILE = "building_profile"
    SIMULATING = "simulating"
    SCORING = "scoring"
    OPTIMIZING = "optimizing"
    EVALUATING_VARIANTS = "evaluating_variants"
    SELECTING_WINNER = "selecting_winner"
    COMPLETED = "completed"
    FAILED = "failed"


class ViralityJob(BaseModel):
    """State model for a running or completed Virality Lab pipeline job."""

    run_id: str = Field(..., description="Unique alphanumeric run identifier.")
    status: JobStatus = Field(default=JobStatus.QUEUED)
    stage: PipelineStage = Field(default=PipelineStage.QUEUED)
    progress: int = Field(default=0, ge=0, le=100, description="Estimated completion percentage.")
    message: str = Field(default="Job initialized and queued.", description="Human-readable progress message.")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    request_data: Optional[Dict[str, Any]] = Field(default=None)
    result_data: Optional[Dict[str, Any]] = Field(default=None)
    error_data: Optional[Dict[str, Any]] = Field(default=None)


class RunStore(ABC):
    """Abstract store for job state tracking."""

    @abstractmethod
    def create_job(self, run_id: str, request_data: Optional[Dict[str, Any]] = None) -> ViralityJob:
        """Create and persist a new job."""
        pass

    @abstractmethod
    def get_job(self, run_id: str) -> Optional[ViralityJob]:
        """Fetch job state by run_id."""
        pass

    @abstractmethod
    def update_job(
        self,
        run_id: str,
        status: Optional[JobStatus] = None,
        stage: Optional[PipelineStage] = None,
        progress: Optional[int] = None,
        message: Optional[str] = None,
        result_data: Optional[Dict[str, Any]] = None,
        error_data: Optional[Dict[str, Any]] = None,
    ) -> Optional[ViralityJob]:
        """Update job progress or result."""
        pass

    @abstractmethod
    def list_jobs(self, limit: int = 50) -> List[ViralityJob]:
        """List recently created jobs."""
        pass

    @abstractmethod
    def delete_job(self, run_id: str) -> bool:
        """Delete job by run_id."""
        pass


class MemoryRunStore(RunStore):
    """
    Thread-safe in-memory implementation of RunStore for development and testing.
    """

    def __init__(self) -> None:
        self._jobs: Dict[str, ViralityJob] = {}
        self._lock = threading.Lock()

    def create_job(self, run_id: str, request_data: Optional[Dict[str, Any]] = None) -> ViralityJob:
        with self._lock:
            job = ViralityJob(
                run_id=run_id,
                status=JobStatus.QUEUED,
                stage=PipelineStage.QUEUED,
                progress=0,
                message="Job queued.",
                request_data=request_data,
            )
            self._jobs[run_id] = job
            return job

    def get_job(self, run_id: str) -> Optional[ViralityJob]:
        with self._lock:
            return self._jobs.get(run_id)

    def update_job(
        self,
        run_id: str,
        status: Optional[JobStatus] = None,
        stage: Optional[PipelineStage] = None,
        progress: Optional[int] = None,
        message: Optional[str] = None,
        result_data: Optional[Dict[str, Any]] = None,
        error_data: Optional[Dict[str, Any]] = None,
    ) -> Optional[ViralityJob]:
        with self._lock:
            job = self._jobs.get(run_id)
            if not job:
                return None

            updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
            if status is not None:
                updates["status"] = status
            if stage is not None:
                updates["stage"] = stage
            if progress is not None:
                updates["progress"] = max(0, min(100, progress))
            if message is not None:
                updates["message"] = message
            if result_data is not None:
                updates["result_data"] = result_data
            if error_data is not None:
                updates["error_data"] = error_data

            updated_job = job.model_copy(update=updates)
            self._jobs[run_id] = updated_job
            return updated_job

    def list_jobs(self, limit: int = 50) -> List[ViralityJob]:
        with self._lock:
            sorted_jobs = sorted(self._jobs.values(), key=lambda j: j.created_at, reverse=True)
            return sorted_jobs[:limit]

    def delete_job(self, run_id: str) -> bool:
        with self._lock:
            if run_id in self._jobs:
                del self._jobs[run_id]
                return True
            return False
