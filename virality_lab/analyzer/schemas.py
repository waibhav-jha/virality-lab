"""
Pydantic schemas for the Content Intelligence / Content Analysis Layer.
Defines ContentProfile and all granular sub-profiles (text, hook, visual, audio, transcript, structure, emotional, and engagement signals).
Strictly separates Layer 1 (Objective Observation) from Layer 2 (Content Interpretation Signals) and Layer 3 (Audience Persona Reactions).
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator

from virality_lab.core.content import MediaType, Platform


class AnalysisCapability(BaseModel):
    """Tracks availability, confidence, and source of an individual analysis capability."""

    available: bool = Field(default=True, description="Whether this feature was computed.")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence in the analysis (0.0 to 1.0).")
    source: str = Field(default="heuristic", description="Method used: 'heuristic', 'ffmpeg', 'mock', 'llm', 'not_implemented'.")


class AnalysisMetadata(BaseModel):
    """Audit provenance and capability summary for how the ContentProfile was generated."""

    analysis_version: str = Field(default="0.3.0")
    analyzers_used: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    available_capabilities: List[str] = Field(default_factory=list)
    failed_capabilities: List[str] = Field(default_factory=list)
    capabilities: Dict[str, AnalysisCapability] = Field(default_factory=dict)


class BasicMediaInfo(BaseModel):
    """Basic objective media metadata extracted from the content asset (Layer 1)."""

    content_id: Optional[str] = Field(default=None)
    platform: Platform = Field(default=Platform.GENERIC)
    media_type: MediaType = Field(default=MediaType.SHORT_VIDEO)
    duration_sec: Optional[float] = Field(default=None, ge=0.0, description="Media duration in seconds.")
    width: Optional[int] = Field(default=None, ge=0, description="Width in pixels.")
    height: Optional[int] = Field(default=None, ge=0, description="Height in pixels.")
    aspect_ratio: Optional[float] = Field(default=None, description="Width / Height ratio.")
    caption: Optional[str] = Field(default=None, description="Raw text or caption accompanying the asset.")
    transcript: Optional[str] = Field(default=None, description="Raw spoken dialogue or transcript.")
    language: str = Field(default="en", description="Primary detected or configured language.")
    file_size_bytes: Optional[int] = Field(default=None, ge=0)
    fps: Optional[float] = Field(default=None, ge=0.0)
    codec: Optional[str] = Field(default=None)

    @property
    def duration(self) -> Optional[float]:
        """Alias for duration_sec."""
        return self.duration_sec


class TextAnalysis(BaseModel):
    """Objective and stylistic characteristics of caption / text content (Layer 1 & Layer 2)."""

    char_count: int = Field(default=0, ge=0)
    word_count: int = Field(default=0, ge=0)
    sentence_count: int = Field(default=0, ge=0)
    readability_score: float = Field(default=70.0, description="Flesch Reading Ease estimate or equivalent (0-100).")
    question_count: int = Field(default=0, ge=0)
    exclamation_count: int = Field(default=0, ge=0)
    hashtags: List[str] = Field(default_factory=list)
    mentions: List[str] = Field(default_factory=list)
    has_url: bool = Field(default=False, description="Presence of links or URLs.")
    cta_present: bool = Field(default=False)
    cta_type: Optional[str] = Field(default=None, description="e.g. 'follow', 'link_in_bio', 'comment', 'share', 'save'")
    
    # Stylistic categories (signals 0.0 to 1.0)
    is_informational: float = Field(default=0.0, ge=0.0, le=1.0)
    is_educational: float = Field(default=0.0, ge=0.0, le=1.0)
    is_humorous: float = Field(default=0.0, ge=0.0, le=1.0)
    is_emotional: float = Field(default=0.0, ge=0.0, le=1.0)
    is_controversial: float = Field(default=0.0, ge=0.0, le=1.0)
    is_promotional: float = Field(default=0.0, ge=0.0, le=1.0)
    is_storytelling: float = Field(default=0.0, ge=0.0, le=1.0)
    is_personal: float = Field(default=0.0, ge=0.0, le=1.0)
    is_opinion_based: float = Field(default=0.0, ge=0.0, le=1.0)
    is_question_based: float = Field(default=0.0, ge=0.0, le=1.0)
    is_list_based: float = Field(default=0.0, ge=0.0, le=1.0)
    is_instructional: float = Field(default=0.0, ge=0.0, le=1.0)

    @property
    def hashtag_count(self) -> int:
        """Total count of extracted hashtags."""
        return len(self.hashtags)

    @property
    def mention_count(self) -> int:
        """Total count of extracted mentions."""
        return len(self.mentions)


class HookType(str, Enum):
    """Class of opening hook mechanism."""

    CURIOSITY_GAP = "curiosity_gap"
    CONTRARIAN_STATEMENT = "contrarian_statement"
    PROBLEM_AGITATION = "problem_agitation"
    STORY_IN_MEDIAS_RES = "story_in_medias_res"
    VALUE_PROMISE = "value_promise"
    QUESTION = "question"
    PATTERN_INTERRUPT = "pattern_interrupt"
    GENERIC = "generic"


class HookAnalysis(BaseModel):
    """Analysis of the opening hook (first 0-3 seconds or opening caption sentence)."""

    hook_text: str = Field(default="", description="Opening text, caption hook, or dialogue spoken in first 0-3s.")
    hook_type: HookType = Field(default=HookType.GENERIC)
    hook_duration_sec: float = Field(default=3.0, ge=0.0, description="Configured duration of the opening hook window.")
    hook_strength: float = Field(default=0.5, ge=0.0, le=1.0, description="Overall hook stopping power signal (0-1).")
    curiosity: float = Field(default=0.5, ge=0.0, le=1.0, description="Curiosity gap signal (0-1).")
    clarity: float = Field(default=0.5, ge=0.0, le=1.0, description="Immediate clarity of premise (0-1).")
    novelty: float = Field(default=0.5, ge=0.0, le=1.0, description="Novelty / freshness of opening (0-1).")
    emotional_intensity: float = Field(default=0.5, ge=0.0, le=1.0, description="Emotional urgency of opening (0-1).")
    specificity: float = Field(default=0.5, ge=0.0, le=1.0, description="Presence of specific numbers/proof vs vague claims (0-1).")

    @property
    def strength(self) -> float:
        """Alias for hook_strength."""
        return self.hook_strength


class VisualHookAnalysis(BaseModel):
    """Analysis of visual elements in the opening frame / thumbnail."""

    first_frame_clarity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    subject_visibility: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    subject_clarity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    visual_curiosity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    text_overlay_present: Optional[bool] = Field(default=None)
    composition_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    visual_clutter: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    first_frame_strength: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    @property
    def text_overlay(self) -> Optional[bool]:
        """Alias for text_overlay_present."""
        return self.text_overlay_present

    @property
    def composition(self) -> Optional[float]:
        """Alias for composition_score."""
        return self.composition_score


class VisualAnalysis(BaseModel):
    """Visual characteristics of the video or image asset."""

    faces_present: Optional[bool] = Field(default=None)
    face_count: Optional[int] = Field(default=None, ge=0)
    text_present: Optional[bool] = Field(default=None)
    detected_objects: List[str] = Field(default_factory=list)
    scene_count: Optional[int] = Field(default=None, ge=0)
    scene_changes: Optional[int] = Field(default=None, ge=0)
    visual_complexity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    motion_level: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    brightness: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    contrast: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    colorfulness: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    visual_novelty: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    thumbnail_quality: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    visual_hook: Optional[VisualHookAnalysis] = Field(default=None)

    @property
    def objects(self) -> List[str]:
        """Alias for detected_objects."""
        return self.detected_objects

    @property
    def scene_change_count(self) -> Optional[int]:
        """Alias for scene_changes."""
        return self.scene_changes


class AudioAnalysis(BaseModel):
    """Objective characteristics of audio stream."""

    has_audio: bool = Field(default=False)
    duration_sec: Optional[float] = Field(default=None, ge=0.0)
    speech_present: Optional[bool] = Field(default=None)
    music_present: Optional[bool] = Field(default=None)
    silence_ratio: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    speech_rate_wpm: Optional[float] = Field(default=None, ge=0.0)
    energy_level: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    @property
    def duration(self) -> Optional[float]:
        """Alias for duration_sec."""
        return self.duration_sec

    @property
    def energy(self) -> Optional[float]:
        """Alias for energy_level."""
        return self.energy_level


class TranscriptAnalysis(BaseModel):
    """Analysis of dialogue / speech transcript."""

    transcript_text: Optional[str] = Field(default=None)
    word_count: int = Field(default=0, ge=0)
    speaking_rate_wpm: Optional[float] = Field(default=None, ge=0.0)
    sentence_count: int = Field(default=0, ge=0)
    question_count: int = Field(default=0, ge=0)
    repeated_phrases: List[str] = Field(default_factory=list)
    has_payoff: Optional[bool] = Field(default=None)
    has_cta: Optional[bool] = Field(default=None)
    key_topics: List[str] = Field(default_factory=list)
    hook_candidate: Optional[str] = Field(default=None)
    payoff_candidate: Optional[str] = Field(default=None)


class StructureSegment(BaseModel):
    """A detected functional segment of the narrative arc."""

    detected: bool = Field(default=False)
    start_sec: Optional[float] = Field(default=None, ge=0.0)
    end_sec: Optional[float] = Field(default=None, ge=0.0)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    summary: Optional[str] = Field(default=None)


class ContentStructure(BaseModel):
    """Pacing and narrative structural arc (Hook -> Context -> Development -> Payoff -> CTA)."""

    hook: StructureSegment = Field(default_factory=StructureSegment)
    context: StructureSegment = Field(default_factory=StructureSegment)
    development: StructureSegment = Field(default_factory=StructureSegment)
    payoff: StructureSegment = Field(default_factory=StructureSegment)
    cta: StructureSegment = Field(default_factory=StructureSegment)
    pacing_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)


class EmotionalProfile(BaseModel):
    """Simulated emotional profile and tonal signals in the content."""

    dominant_emotion: str = Field(default="curious")
    emotional_intensity: float = Field(default=0.5, ge=0.0, le=1.0)
    positive_score: float = Field(default=0.5, ge=0.0, le=1.0)
    negative_score: float = Field(default=0.0, ge=0.0, le=1.0)
    surprise: float = Field(default=0.5, ge=0.0, le=1.0)
    humor: float = Field(default=0.5, ge=0.0, le=1.0)
    curiosity: float = Field(default=0.5, ge=0.0, le=1.0)
    fear: float = Field(default=0.0, ge=0.0, le=1.0)
    anger: float = Field(default=0.0, ge=0.0, le=1.0)
    joy: float = Field(default=0.5, ge=0.0, le=1.0)
    sadness: float = Field(default=0.0, ge=0.0, le=1.0)


class EngagementFeatures(BaseModel):
    """
    Objective content signals (Layer 2) that describe intrinsic content affordances.
    NOTE: These are intrinsic content attributes, NOT final audience engagement predictions.
    """

    curiosity_signal: float = Field(default=0.5, ge=0.0, le=1.0)
    relatability_signal: float = Field(default=0.5, ge=0.0, le=1.0)
    novelty_signal: float = Field(default=0.5, ge=0.0, le=1.0)
    controversy_signal: float = Field(default=0.1, ge=0.0, le=1.0)
    usefulness_signal: float = Field(default=0.5, ge=0.0, le=1.0)
    emotional_intensity_signal: float = Field(default=0.5, ge=0.0, le=1.0)
    shareability_signal: float = Field(default=0.5, ge=0.0, le=1.0)
    commentability_signal: float = Field(default=0.5, ge=0.0, le=1.0)
    saveability_signal: float = Field(default=0.5, ge=0.0, le=1.0)

    @property
    def emotional_signal(self) -> float:
        """Alias for emotional_intensity_signal."""
        return self.emotional_intensity_signal


# Alias for EngagementFeatures
EngagementSignals = EngagementFeatures


class ContentProfile(BaseModel):
    """
    Comprehensive structured profile of social media content.
    The primary data transfer object output by the ContentAnalyzer layer.
    """

    content_id: str = Field(..., description="Unique ID of the analyzed Content item.")
    media_info: BasicMediaInfo = Field(default_factory=BasicMediaInfo)
    text_analysis: TextAnalysis = Field(default_factory=TextAnalysis)
    hook_analysis: HookAnalysis = Field(default_factory=HookAnalysis)
    visual_analysis: VisualAnalysis = Field(default_factory=VisualAnalysis)
    audio_analysis: AudioAnalysis = Field(default_factory=AudioAnalysis)
    transcript_analysis: TranscriptAnalysis = Field(default_factory=TranscriptAnalysis)
    structure: ContentStructure = Field(default_factory=ContentStructure)
    emotional_profile: EmotionalProfile = Field(default_factory=EmotionalProfile)
    engagement_features: EngagementFeatures = Field(default_factory=EngagementFeatures)

    # Capability audit logs and metadata
    capabilities: Dict[str, AnalysisCapability] = Field(
        default_factory=dict,
        description="Audit log indicating whether each submodule was computed, its confidence, and source.",
    )
    metadata: Dict[str, Any] = Field(default_factory=dict)
    analysis_metadata: AnalysisMetadata = Field(default_factory=AnalysisMetadata)

    @model_validator(mode="before")
    @classmethod
    def _map_aliases(cls, values: Any) -> Any:
        """Support alternative key names (basic, text, hook, visual, audio, transcript, emotional, engagement_signals)."""
        if isinstance(values, dict):
            if "basic" in values and "media_info" not in values:
                values["media_info"] = values.pop("basic")
            if "text" in values and "text_analysis" not in values:
                values["text_analysis"] = values.pop("text")
            if "hook" in values and "hook_analysis" not in values:
                values["hook_analysis"] = values.pop("hook")
            if "visual" in values and "visual_analysis" not in values:
                values["visual_analysis"] = values.pop("visual")
            if "audio" in values and "audio_analysis" not in values:
                values["audio_analysis"] = values.pop("audio")
            if "transcript" in values and "transcript_analysis" not in values:
                values["transcript_analysis"] = values.pop("transcript")
            if "emotional" in values and "emotional_profile" not in values:
                values["emotional_profile"] = values.pop("emotional")
            if "engagement_signals" in values and "engagement_features" not in values:
                values["engagement_features"] = values.pop("engagement_signals")
        return values

    @property
    def basic(self) -> BasicMediaInfo:
        """Alias for media_info."""
        return self.media_info

    @property
    def text(self) -> TextAnalysis:
        """Alias for text_analysis."""
        return self.text_analysis

    @property
    def hook(self) -> HookAnalysis:
        """Alias for hook_analysis."""
        return self.hook_analysis

    @property
    def visual(self) -> VisualAnalysis:
        """Alias for visual_analysis."""
        return self.visual_analysis

    @property
    def audio(self) -> AudioAnalysis:
        """Alias for audio_analysis."""
        return self.audio_analysis

    @property
    def transcript(self) -> TranscriptAnalysis:
        """Alias for transcript_analysis."""
        return self.transcript_analysis

    @property
    def emotional(self) -> EmotionalProfile:
        """Alias for emotional_profile."""
        return self.emotional_profile

    @property
    def engagement_signals(self) -> EngagementFeatures:
        """Alias for engagement_features."""
        return self.engagement_features

    def summary_dict(self) -> Dict[str, Any]:
        """Convenience dictionary summary of top-level content characteristics."""
        return {
            "content_id": self.content_id,
            "platform": self.media_info.platform.value,
            "media_type": self.media_info.media_type.value,
            "duration": f"{self.media_info.duration_sec:.1f}s" if self.media_info.duration_sec is not None else "N/A",
            "hook_text": self.hook_analysis.hook_text,
            "hook_strength": self.hook_analysis.hook_strength,
            "curiosity_signal": self.engagement_features.curiosity_signal,
            "novelty_signal": self.engagement_features.novelty_signal,
            "cta_present": self.text_analysis.cta_present,
            "has_audio": self.audio_analysis.has_audio,
        }
