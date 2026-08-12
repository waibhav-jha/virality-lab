"""
Unit tests for MockContentAnalyzer and LocalContentAnalyzer.
"""

import pytest
from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.analyzer.mock_analyzer import MockContentAnalyzer
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Content, MediaType, Platform


def test_mock_content_analyzer_generates_valid_profile():
    """Verify MockContentAnalyzer produces a fully populated ContentProfile."""
    analyzer = MockContentAnalyzer()
    content = Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="I replaced 3 hours of college work with AI in 2026.",
        transcript="If you are doing manual research in 2026, stop. Here are 3 tools.",
    )

    profile = analyzer.analyze(content)

    assert isinstance(profile, ContentProfile)
    assert profile.content_id == content.id
    assert profile.media_info.platform == Platform.INSTAGRAM_REELS
    assert profile.media_info.duration_sec == 18.4
    assert profile.hook_analysis.hook_strength > 0.8
    assert profile.engagement_features.curiosity_signal > 0.85
    assert profile.structure.hook.detected is True
    assert profile.structure.payoff.detected is True
    assert "mock" in profile.capabilities["hook_analysis"].source


def test_local_content_analyzer_short_video_content():
    """Verify LocalContentAnalyzer on short video content with text and transcript."""
    analyzer = LocalContentAnalyzer()
    content = Content(
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        caption="Stop studying manually! 3 AI tools to save 10 hours this week #study #ai",
        transcript="Stop studying manually. Here are 3 AI tools to finish your assignments in 10 minutes.",
        metadata={"duration_sec": 22.0},
    )

    profile = analyzer.analyze(content)

    assert isinstance(profile, ContentProfile)
    assert profile.media_info.duration_sec == 22.0
    assert profile.text_analysis.word_count > 5
    assert profile.transcript_analysis.word_count > 5
    assert profile.hook_analysis.hook_strength > 0.5
    assert profile.structure.hook.detected is True
    assert profile.structure.context.detected is True
    assert profile.structure.payoff.detected is True
    assert profile.engagement_features.curiosity_signal > 0.5


def test_local_content_analyzer_image_content():
    """Verify LocalContentAnalyzer on image content (duration=None, no audio)."""
    analyzer = LocalContentAnalyzer()
    content = Content(
        platform=Platform.X_TWITTER,
        media_type=MediaType.IMAGE,
        caption="Infographic: The 5 core principles of modern system design.",
    )

    profile = analyzer.analyze(content)

    assert profile.media_info.duration_sec is None
    assert profile.media_info.media_type == MediaType.IMAGE
    assert profile.audio_analysis.has_audio is False
    assert profile.text_analysis.word_count == 9


def test_local_content_analyzer_text_post_content():
    """Verify LocalContentAnalyzer on text post content."""
    analyzer = LocalContentAnalyzer()
    content = Content(
        platform=Platform.LINKEDIN,
        media_type=MediaType.TEXT_POST,
        caption="Why remote work is here to stay. 3 key insights from our engineering team.",
    )

    profile = analyzer.analyze(content)

    assert profile.media_info.duration_sec is None
    assert profile.media_info.media_type == MediaType.TEXT_POST
    assert profile.text_analysis.is_informational > 0.3


def test_analyzer_type_error_on_invalid_input():
    """Verify TypeError when invalid object passed to analyze()."""
    analyzer = LocalContentAnalyzer()
    with pytest.raises(TypeError):
        analyzer.analyze("invalid string input")  # type: ignore
