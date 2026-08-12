"""
Unit tests for AudiencePromptBuilder.
"""

from virality_lab.analyzer.schemas import BasicMediaInfo, ContentProfile, HookAnalysis, HookType
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.persona import AttentionSpan, Persona
from virality_lab.llm.prompt_templates import AudiencePromptBuilder


def test_prompt_builder_system_prompt_rules_and_traits():
    """Verify system prompt contains scientific simulation rules, persona traits, and behavioral schema."""
    persona = Persona(
        name="Gen-Z Student",
        age_range=(18, 24),
        attention_span=AttentionSpan.LOW,
        trend_sensitivity=0.90,
        novelty_preference=0.85,
        humor_preference=0.80,
        clickbait_tolerance=0.25,
        share_tendency=0.80,
        comment_tendency=0.60,
        interests=["AI", "College", "Gaming"],
        description="Fast scroller seeking productivity hacks.",
        dislikes=["Slow intros", "Corporate speak"],
    )

    builder = AudiencePromptBuilder()
    sys_prompt = builder.build_system_prompt(persona)

    # Scientific principle and boundaries
    assert "You are simulating ONE specific audience persona segment" in sys_prompt
    assert "You are NOT predicting the whole internet" in sys_prompt
    assert "You are NOT guaranteeing real-world virality" in sys_prompt

    # Persona attributes
    assert "Gen-Z Student" in sys_prompt
    assert "18" in sys_prompt and "24" in sys_prompt
    assert "Attention Span" in sys_prompt
    assert "Trend Sensitivity: 0.90" in sys_prompt
    assert "Slow intros" in sys_prompt

    # Causal reasoning instructions
    assert "[CONTENT SIGNAL / HOOK / PACING] -> [PERSONA TRAIT / BIAS / ATTENTION LIMIT] -> [BEHAVIORAL PROBABILITY]" in sys_prompt


def test_prompt_builder_user_prompt_content_and_platform():
    """Verify user prompt properly injects platform context, content profile, and JSON schema task."""
    persona = Persona(
        name="Skeptic",
        age_range=(25, 40),
        attention_span=AttentionSpan.MEDIUM,
        trend_sensitivity=0.30,
        core_interests=["Fact Checking", "Tech"],
    )

    content = Content(
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        caption="Earn $10,000 in 2 days with this simple AI trick #money",
    )

    profile = ContentProfile(
        content_id="skeptic-test-1",
        basic=BasicMediaInfo(platform=Platform.TIKTOK, duration_sec=15.0),
        hook=HookAnalysis(hook_text="Earn $10,000 in 2 days", hook_type=HookType.VALUE_PROMISE, hook_strength=0.85),
    )

    builder = AudiencePromptBuilder()
    user_prompt = builder.build_user_prompt(persona=persona, content=content, profile=profile)

    assert "Platform: TIKTOK" in user_prompt
    assert "Skeptic" in user_prompt
    assert "Earn $10,000 in 2 days" in user_prompt
    assert "stop_scroll" in user_prompt
    assert "watch_probability" in user_prompt
    assert "emotional_response" in user_prompt
