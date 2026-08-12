"""
Unit tests for ContentProfileSerializer.
"""

from virality_lab.analyzer.schemas import (
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
)
from virality_lab.analyzer.serializer import ContentProfileSerializer
from virality_lab.core.content import Content, MediaType, Platform


def test_serializer_full_profile():
    """Verify serializer formats all profile layers into clean Markdown sections."""
    profile = ContentProfile(
        content_id="test-serial-1",
        basic=BasicMediaInfo(platform=Platform.INSTAGRAM_REELS, duration_sec=18.4, width=1080, height=1920),
        text=TextAnalysis(word_count=22, cta_present=True, cta_type="save", hashtags=["#ai", "#study"]),
        hook=HookAnalysis(
            hook_text="Stop doing your assignments manually in 2026.",
            hook_type=HookType.CONTRARIAN_STATEMENT,
            hook_strength=0.88,
            curiosity=0.92,
        ),
        visual=VisualAnalysis(faces_present=True, face_count=1, text_present=True, scene_changes=4),
        transcript=TranscriptAnalysis(speaking_rate_wpm=160.0, key_topics=["ai", "study"]),
        structure=ContentStructure(
            hook=StructureSegment(detected=True, start_sec=0.0, end_sec=3.0, summary="Contrarian statement"),
            pacing_score=0.85,
        ),
        emotional=EmotionalProfile(dominant_emotion="curious", emotional_intensity=0.8),
        engagement_signals=EngagementFeatures(curiosity_signal=0.90, usefulness_signal=0.85),
    )

    serializer = ContentProfileSerializer()
    markdown = serializer.serialize(profile=profile)

    assert "### 1. PLATFORM & FORMAT" in markdown
    assert "INSTAGRAM_REELS" in markdown
    assert "18.4s" in markdown
    assert "### 2. CAPTION & COPY" in markdown
    assert "### 3. OPENING HOOK" in markdown
    assert "Contrarian Statement" in markdown
    assert "0.88" in markdown
    assert "### 4. SPOKEN DIALOGUE & AUDIO" in markdown
    assert "160 WPM" in markdown
    assert "### 5. VISUAL & THUMBNAIL SIGNALS" in markdown
    assert "### 6. NARRATIVE STRUCTURE" in markdown
    assert "### 7. INTRINSIC CONTENT AFFORDANCE SIGNALS" in markdown
    assert "**Curiosity Signal**: 0.90" in markdown


def test_serializer_empty_fields_graceful():
    """Verify serializer gracefully handles minimal/empty content without crashing."""
    profile = ContentProfile(content_id="minimal-1")
    serializer = ContentProfileSerializer()
    markdown = serializer.serialize(profile=profile)

    assert "### 1. PLATFORM & FORMAT" in markdown
    assert "GENERIC" in markdown


def test_serializer_transcript_word_budget_truncation():
    """Verify serializer respects max_transcript_words budget and truncates cleanly."""
    long_transcript = " ".join([f"word{i}" for i in range(200)])
    content = Content(
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        transcript=long_transcript,
    )

    serializer = ContentProfileSerializer(max_transcript_words=50)
    markdown = serializer.serialize(content=content)

    assert "[... truncated for length]" in markdown
    assert "word49" in markdown
    assert "word190" not in markdown
