"""
Structured representation of social media content.
Supports text posts, captions, images, short-form videos, transcripts, and thumbnails.
"""

from enum import Enum
from typing import Any, Dict, Optional
import uuid
from pydantic import BaseModel, Field, field_validator


class Platform(str, Enum):
    """Target social media platform for simulation."""

    TIKTOK = "tiktok"
    INSTAGRAM_REELS = "instagram_reels"
    YOUTUBE_SHORTS = "youtube_shorts"
    X_TWITTER = "x_twitter"
    LINKEDIN = "linkedin"
    THREADS = "threads"
    FACEBOOK = "facebook"
    GENERIC = "generic"


class MediaType(str, Enum):
    """Media type of the content."""

    SHORT_VIDEO = "short_video"
    IMAGE = "image"
    TEXT_POST = "text_post"
    CAROUSEL = "carousel"
    THUMBNAIL = "thumbnail"
    AUDIO = "audio"


class Content(BaseModel):
    """Standardized representation of social media content for testing in Virality Lab."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, v: Any) -> str:
        if v is None or not str(v).strip():
            return str(uuid.uuid4())
        return str(v)

    @field_validator("platform", mode="before")
    @classmethod
    def normalize_platform(cls, v: Any) -> Platform:
        if isinstance(v, Platform):
            return v
        if not isinstance(v, str):
            return Platform.INSTAGRAM_REELS
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

    platform: Platform = Field(default=Platform.INSTAGRAM_REELS, description="Target platform for the content.")
    media_type: MediaType = Field(default=MediaType.SHORT_VIDEO, description="Type of creative asset.")
    media_path: Optional[str] = Field(default=None, description="Local or remote path to image/video asset.")
    caption: Optional[str] = Field(default=None, description="Accompanying caption or text body.")
    transcript: Optional[str] = Field(default=None, description="Spoken dialogue or audio transcript.")
    target_audience: Optional[str] = Field(default=None, description="Intended audience description.")
    goal: Optional[str] = Field(default=None, description="Creator's goal, e.g. drive shares, entertain, educate.")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional custom metadata or analyzer outputs.")
    profile: Optional[Any] = Field(default=None, description="Optional structured ContentProfile produced by ContentAnalyzer.")

    def to_prompt_context(self) -> str:
        """Serialize the content into structured, clean Markdown for LLM prompt context."""
        parts = [
            f"- **Platform**: {self.platform.value}",
            f"- **Media Type**: {self.media_type.value}",
        ]
        if self.caption:
            parts.append(f"- **Caption / Text**: \"{self.caption}\"")
        if self.transcript:
            parts.append(f"- **Transcript / Dialogue**: \"{self.transcript}\"")
        if self.target_audience:
            parts.append(f"- **Target Audience**: {self.target_audience}")
        if self.goal:
            parts.append(f"- **Primary Goal**: {self.goal}")
        if self.media_path:
            parts.append(f"- **Media Asset Path**: {self.media_path}")
        if self.metadata:
            for k, v in self.metadata.items():
                parts.append(f"- **{k.replace('_', ' ').title()}**: {v}")

        # If ContentProfile is present, serialize structured intelligence signals
        if self.profile:
            p = self.profile
            basic = getattr(p, "media_info", getattr(p, "basic", None))
            if basic and getattr(basic, "duration_sec", None):
                parts.append(f"- **Video Duration**: {basic.duration_sec:.1f}s (Dimensions: {getattr(basic, 'width', 'N/A')}x{getattr(basic, 'height', 'N/A')})")

            text_p = getattr(p, "text_analysis", getattr(p, "text", None))
            if text_p and getattr(text_p, "cta_present", False):
                parts.append(f"- **Call to Action**: Present (Type: '{getattr(text_p, 'cta_type', 'unspecified')}')")

            hook = getattr(p, "hook_analysis", getattr(p, "hook", None))
            if hook and getattr(hook, "hook_text", None):
                h_type = getattr(hook.hook_type, "value", str(hook.hook_type)) if hasattr(hook, "hook_type") else "generic"
                parts.append(f"- **Opening Hook (0-3s)**: \"{hook.hook_text}\" (Type: {h_type}, Strength: {getattr(hook, 'hook_strength', 0.5):.2f}, Curiosity: {getattr(hook, 'curiosity', 0.5):.2f})")

            visual = getattr(p, "visual_analysis", getattr(p, "visual", None))
            if visual and getattr(visual, "faces_present", None) is not None:
                parts.append(f"- **Visual Elements**: Faces={visual.faces_present} (Count: {getattr(visual, 'face_count', 0)}), Text Overlay={getattr(visual, 'text_present', False)}, Scene Cuts={getattr(visual, 'scene_changes', 0)}")

            audio = getattr(p, "audio_analysis", getattr(p, "audio", None))
            if audio and getattr(audio, "has_audio", False):
                parts.append(f"- **Audio Stream**: Active (Speech={getattr(audio, 'speech_present', True)}, Music={getattr(audio, 'music_present', True)})")

            structure = getattr(p, "structure", None)
            if structure and getattr(structure, "pacing_score", None) is not None:
                parts.append(f"- **Narrative Pacing Score**: {structure.pacing_score:.2f}")

            eng = getattr(p, "engagement_features", getattr(p, "engagement_signals", None))
            if eng:
                parts.append(f"- **Curiosity Signal**: {getattr(eng, 'curiosity_signal', 0.5):.2f}")
                parts.append(f"- **Novelty Signal**: {getattr(eng, 'novelty_signal', 0.5):.2f}")
                parts.append(f"- **Usefulness Signal**: {getattr(eng, 'usefulness_signal', 0.5):.2f}")
                parts.append(f"- **Relatability Signal**: {getattr(eng, 'relatability_signal', 0.5):.2f}")

        return "\n".join(parts)
