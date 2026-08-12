"""
Application-Level Request & Response Schemas for Virality Lab API.
Ensures strong typing, serialization, and schema validation for client interactions.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator

from virality_lab.core.content import MediaType, Platform
from virality_lab.optimizer.schemas import OptimizationObjective
from virality_lab.storage.runs import JobStatus, PipelineStage


class ContentInput(BaseModel):
    """Client input payload representing a piece of social content."""

    id: Optional[str] = Field(default=None, description="Optional custom content ID.")

    @field_validator("platform", mode="before")
    @classmethod
    def normalize_platform(cls, v: Any) -> Platform:
        if isinstance(v, Platform):
            return v
        if not isinstance(v, str):
            return Platform.TIKTOK
        val = v.lower().strip()
        alias_map = {
            "tiktok": Platform.TIKTOK,
            "instagram": Platform.INSTAGRAM_REELS,
            "instagram_reels": Platform.INSTAGRAM_REELS,
            "reels": Platform.INSTAGRAM_REELS,
            "youtube": Platform.YOUTUBE_SHORTS,
            "youtube_shorts": Platform.YOUTUBE_SHORTS,
            "shorts": Platform.YOUTUBE_SHORTS,
            "x": Platform.X_TWITTER,
            "twitter": Platform.X_TWITTER,
            "x_twitter": Platform.X_TWITTER,
            "linkedin": Platform.LINKEDIN,
            "threads": Platform.THREADS,
            "facebook": Platform.FACEBOOK,
            "generic": Platform.GENERIC,
        }
        return alias_map.get(val, Platform.GENERIC)

    @field_validator("media_type", mode="before")
    @classmethod
    def normalize_media_type(cls, v: Any) -> MediaType:
        if isinstance(v, MediaType):
            return v
        if not isinstance(v, str):
            return MediaType.SHORT_VIDEO
        val = v.lower().strip()
        alias_map = {
            "short_video": MediaType.SHORT_VIDEO,
            "video": MediaType.SHORT_VIDEO,
            "long_video": MediaType.SHORT_VIDEO,
            "image": MediaType.IMAGE,
            "photo": MediaType.IMAGE,
            "text": MediaType.TEXT_POST,
            "text_post": MediaType.TEXT_POST,
            "carousel": MediaType.CAROUSEL,
            "thumbnail": MediaType.THUMBNAIL,
            "audio": MediaType.AUDIO,
        }
        return alias_map.get(val, MediaType.SHORT_VIDEO)

    platform: Platform = Field(default=Platform.TIKTOK, description="Target platform.")
    media_type: MediaType = Field(default=MediaType.SHORT_VIDEO, description="Media format.")
    caption: Optional[str] = Field(default="", description="Post caption, tweet text, or description.")
    transcript: Optional[str] = Field(default=None, description="Spoken transcript or script content.")
    media_path: Optional[str] = Field(default=None, description="Path to uploaded image/video file.")
    thumbnail_path: Optional[str] = Field(default=None, description="Path to thumbnail image file.")
    target_audience: Optional[str] = Field(default=None, description="Creator's target demographic description.")
    goal: Optional[str] = Field(default=None, description="Creator's campaign goal.")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom metadata tags.")

    def to_content(self) -> "Content":
        from virality_lab.core.content import Content
        return Content(
            id=self.id,
            platform=self.platform,
            media_type=self.media_type,
            caption=self.caption,
            transcript=self.transcript,
            media_path=self.media_path,
            target_audience=self.target_audience,
            goal=self.goal,
            metadata=self.metadata,
        )


class TargetAudienceConfig(BaseModel):
    """Demographic and persona targeting configuration."""

    description: Optional[str] = Field(default=None, description="Demographic context.")
    persona_weights: Optional[Dict[str, float]] = Field(default=None, description="Custom weighting per persona.")
    selected_personas: Optional[List[str]] = Field(default=None, description="Subset of personas to simulate.")


class AnalyzeRequest(BaseModel):
    """Request schema for Content Intelligence analysis."""

    content: ContentInput


class AnalyzeResponse(BaseModel):
    """Response schema for Content Intelligence analysis."""

    content_profile: Dict[str, Any]
    summary: str = Field(default="Content analysis completed.")


class SimulationRequest(BaseModel):
    """Request schema for Audience Simulation."""

    content: ContentInput
    target_audience: Optional[TargetAudienceConfig] = None
    personas: Optional[List[str]] = None


class SimulationResponse(BaseModel):
    """Response schema for Audience Simulation."""

    simulation_result: Dict[str, Any]
    agent_count: int
    success_rate: float


class ScoreRequest(BaseModel):
    """Request schema for Virality Scoring."""

    simulation_result: Dict[str, Any]
    platform: Optional[Platform] = None

    @field_validator("platform", mode="before")
    @classmethod
    def normalize_platform(cls, v: Any) -> Optional[Platform]:
        if v is None:
            return None
        if isinstance(v, Platform):
            return v
        if not isinstance(v, str):
            return None
        val = v.lower().strip()
        alias_map = {
            "tiktok": Platform.TIKTOK,
            "instagram": Platform.INSTAGRAM_REELS,
            "instagram_reels": Platform.INSTAGRAM_REELS,
            "reels": Platform.INSTAGRAM_REELS,
            "youtube": Platform.YOUTUBE_SHORTS,
            "youtube_shorts": Platform.YOUTUBE_SHORTS,
            "shorts": Platform.YOUTUBE_SHORTS,
            "x": Platform.X_TWITTER,
            "twitter": Platform.X_TWITTER,
            "x_twitter": Platform.X_TWITTER,
            "linkedin": Platform.LINKEDIN,
            "threads": Platform.THREADS,
            "facebook": Platform.FACEBOOK,
            "generic": Platform.GENERIC,
        }
        return alias_map.get(val, Platform.GENERIC)

    content_profile: Optional[Dict[str, Any]] = None


class ScoreResponse(BaseModel):
    """Response schema for Virality Scoring."""

    virality_score: Dict[str, Any]
    overall_score: float
    strongest_dimension: str
    weakest_dimension: str


class OptimizationRequest(BaseModel):
    """Request schema for Content Optimization."""

    content: ContentInput
    objective: OptimizationObjective = OptimizationObjective.OVERALL

    @field_validator("objective", mode="before")
    @classmethod
    def normalize_objective(cls, v: Any) -> OptimizationObjective:
        if isinstance(v, OptimizationObjective):
            return v
        if not isinstance(v, str):
            return OptimizationObjective.OVERALL
        val = v.lower().strip()
        alias_map = {
            "overall": OptimizationObjective.OVERALL,
            "reach": OptimizationObjective.REACH,
            "retention": OptimizationObjective.RETENTION,
            "shares": OptimizationObjective.SHARES,
            "share": OptimizationObjective.SHARES,
            "comments": OptimizationObjective.COMMENTS,
            "comment": OptimizationObjective.COMMENTS,
            "saves": OptimizationObjective.SAVES,
            "save": OptimizationObjective.SAVES,
            "followers": OptimizationObjective.FOLLOWERS,
            "follower": OptimizationObjective.FOLLOWERS,
            "conversion": OptimizationObjective.FOLLOWERS,
        }
        return alias_map.get(val, OptimizationObjective.OVERALL)

    max_iterations: int = Field(default=1, ge=1, le=5)
    content_profile: Optional[Dict[str, Any]] = None
    virality_score: Optional[Dict[str, Any]] = None


class OptimizationResponse(BaseModel):
    """Response schema for Content Optimization."""

    optimization_result: Dict[str, Any]
    original_score: float
    best_score: float
    overall_improvement: float
    best_content: Dict[str, Any]


class FullAnalysisRequest(BaseModel):
    """Request schema for end-to-end pipeline run."""

    content: ContentInput
    target_audience: Optional[TargetAudienceConfig] = None
    goal: Optional[OptimizationObjective] = Field(default=OptimizationObjective.OVERALL)

    @field_validator("goal", mode="before")
    @classmethod
    def normalize_goal(cls, v: Any) -> OptimizationObjective:
        if isinstance(v, OptimizationObjective):
            return v
        if not isinstance(v, str):
            return OptimizationObjective.OVERALL
        val = v.lower().strip()
        alias_map = {
            "overall": OptimizationObjective.OVERALL,
            "reach": OptimizationObjective.REACH,
            "retention": OptimizationObjective.RETENTION,
            "shares": OptimizationObjective.SHARES,
            "share": OptimizationObjective.SHARES,
            "comments": OptimizationObjective.COMMENTS,
            "comment": OptimizationObjective.COMMENTS,
            "saves": OptimizationObjective.SAVES,
            "save": OptimizationObjective.SAVES,
            "followers": OptimizationObjective.FOLLOWERS,
            "follower": OptimizationObjective.FOLLOWERS,
            "conversion": OptimizationObjective.FOLLOWERS,
        }
        return alias_map.get(val, OptimizationObjective.OVERALL)

    optimization_enabled: bool = Field(default=True)
    optimization_iterations: int = Field(default=1, ge=1, le=5)
    async_execution: bool = Field(
        default=False,
        description="If True, returns immediately with run_id for background polling. If False, waits for completion.",
    )


class FullAnalysisResponse(BaseModel):
    """Comprehensive response schema for full pipeline execution."""

    run_id: str
    status: str
    content: Optional[Dict[str, Any]] = None
    content_profile: Optional[Dict[str, Any]] = None
    simulation: Optional[Dict[str, Any]] = None
    score: Optional[Dict[str, Any]] = None
    optimization: Optional[Dict[str, Any]] = None
    best_content: Optional[Dict[str, Any]] = None
    best_score: Optional[Dict[str, Any]] = None
    overall_improvement: Optional[float] = None


class JobStatusResponse(BaseModel):
    """Polling response for asynchronous pipeline runs."""

    run_id: str
    status: JobStatus
    stage: PipelineStage
    progress: int
    message: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None


class UploadResponse(BaseModel):
    """Response returned upon successful media file upload."""

    file_path: str
    filename: str
    size_bytes: int
    mime_type: Optional[str] = None


class ErrorDetail(BaseModel):
    """Standardized error payload."""

    code: str
    message: str
    run_id: Optional[str] = None


class ErrorResponse(BaseModel):
    """Top-level error response model."""

    error: ErrorDetail
