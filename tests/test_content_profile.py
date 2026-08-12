"""
Unit tests for ContentProfile schema and sub-profile models.
"""

import pytest
from pydantic import ValidationError
from virality_lab.analyzer.schemas import (
    AnalysisCapability,
    AudioAnalysis,
    BasicMediaInfo,
    ContentProfile,
    ContentStructure,
    EmotionalProfile,
    EngagementFeatures,
    HookAnalysis,
    HookType,
    StructureSegment,
    TextAnalysis,
    TranscriptAnalysis,
    VisualAnalysis,
    VisualHookAnalysis,
)
from virality_lab.core.content import MediaType, Platform


def test_valid_content_profile_creation():
    """Verify that a complete ContentProfile can be instantiated with valid types and bounds."""
    profile = ContentProfile(
        content_id="test-content-123",
        media_info=BasicMediaInfo(
            platform=Platform.TIKTOK,
            media_type=MediaType.SHORT_VIDEO,
            duration_sec=21.5,
            width=1080,
            height=1920,
            aspect_ratio=0.5625,
        ),
        text_analysis=TextAnalysis(
            char_count=85,
            word_count=14,
            sentence_count=2,
            cta_present=True,
            cta_type="save",
            is_educational=0.90,
        ),
        hook_analysis=HookAnalysis(
            hook_text="Stop doing your assignments manually in 2026.",
            hook_type=HookType.CONTRARIAN_STATEMENT,
            hook_strength=0.88,
            curiosity=0.92,
        ),
        engagement_features=EngagementFeatures(
            curiosity_signal=0.92,
            novelty_signal=0.80,
            usefulness_signal=0.85,
        ),
    )

    assert profile.content_id == "test-content-123"
    assert profile.media_info.platform == Platform.TIKTOK
    assert profile.text_analysis.cta_type == "save"
    assert profile.hook_analysis.hook_type == HookType.CONTRARIAN_STATEMENT
    assert profile.engagement_features.curiosity_signal == 0.92

    summary = profile.summary_dict()
    assert summary["content_id"] == "test-content-123"
    assert summary["platform"] == "tiktok"
    assert summary["cta_present"] is True


def test_content_profile_defaults_and_optionals():
    """Verify default initializations for missing/optional fields."""
    profile = ContentProfile(content_id="minimal-123")
    assert profile.content_id == "minimal-123"
    assert profile.media_info.duration_sec is None
    assert profile.media_info.width is None
    assert profile.visual_analysis.faces_present is None
    assert profile.audio_analysis.has_audio is False
    assert profile.structure.hook.detected is False


def test_engagement_features_bounds_validation():
    """Verify that signal values outside [0.0, 1.0] raise ValidationError."""
    with pytest.raises(ValidationError):
        EngagementFeatures(curiosity_signal=1.5)

    with pytest.raises(ValidationError):
        EngagementFeatures(novelty_signal=-0.1)


def test_hook_analysis_bounds_validation():
    """Verify that HookAnalysis enforces [0.0, 1.0] bounds on signals."""
    with pytest.raises(ValidationError):
        HookAnalysis(hook_strength=1.2)

    with pytest.raises(ValidationError):
        HookAnalysis(curiosity=-0.05)


def test_analysis_capability_tracking():
    """Verify AnalysisCapability metadata records availability, source, and confidence."""
    cap = AnalysisCapability(available=True, confidence=0.95, source="ffmpeg")
    assert cap.available is True
    assert cap.confidence == 0.95
    assert cap.source == "ffmpeg"

    with pytest.raises(ValidationError):
        AnalysisCapability(confidence=1.5)


def test_content_profile_aliases_and_properties():
    """Verify that both named representations (e.g. basic, text, hook, visual, audio, emotional, engagement_signals) work."""
    profile = ContentProfile(
        content_id="alias-test-1",
        basic=BasicMediaInfo(platform=Platform.YOUTUBE_SHORTS, duration_sec=15.0),
        text=TextAnalysis(char_count=50, word_count=8, has_url=True, is_list_based=0.8),
        hook=HookAnalysis(hook_text="Check this out", hook_strength=0.9),
        visual=VisualAnalysis(detected_objects=["car", "road"], scene_changes=4),
        audio=AudioAnalysis(has_audio=True, duration_sec=15.0, energy_level=0.75),
        transcript=TranscriptAnalysis(transcript_text="hello world", word_count=2),
        emotional=EmotionalProfile(dominant_emotion="joy", emotional_intensity=0.8),
        engagement_signals=EngagementFeatures(curiosity_signal=0.85, shareability_signal=0.7),
    )

    # Test properties
    assert profile.basic.platform == Platform.YOUTUBE_SHORTS
    assert profile.basic.duration == 15.0
    assert profile.text.has_url is True
    assert profile.text.is_list_based == 0.8
    assert profile.hook.strength == 0.9
    assert profile.visual.objects == ["car", "road"]
    assert profile.visual.scene_change_count == 4
    assert profile.audio.duration == 15.0
    assert profile.audio.energy == 0.75
    assert profile.transcript.word_count == 2
    assert profile.emotional.dominant_emotion == "joy"
    assert profile.engagement_signals.emotional_signal == 0.5
    assert profile.engagement_signals.curiosity_signal == 0.85
    assert profile.analysis_metadata.analysis_version is not None
