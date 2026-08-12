"""
Unit tests verifying persona differentiation in prompt context assembly.
"""

from virality_lab.config.loader import load_default_personas
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.llm.prompt_templates import AudiencePromptBuilder


def test_personas_produce_distinct_prompt_contexts():
    """Verify that distinct personas generate distinct, tailored prompt contexts."""
    personas = load_default_personas()
    assert len(personas) >= 5

    gen_z = next(p for p in personas if "gen-z" in p.name.lower())
    skeptic = next(p for p in personas if "skeptic" in p.name.lower())

    content = Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="5 AI tools to automate your homework in 2026.",
    )

    builder = AudiencePromptBuilder()
    sys_gen_z, user_gen_z = builder.build_prompts(persona=gen_z, content=content)
    sys_skeptic, user_skeptic = builder.build_prompts(persona=skeptic, content=content)

    # System prompts must be distinct
    assert sys_gen_z != sys_skeptic
    assert gen_z.name in sys_gen_z
    assert skeptic.name in sys_skeptic
    assert str(gen_z.trend_sensitivity) in sys_gen_z
    assert str(skeptic.trend_sensitivity) in sys_skeptic

    # User prompts must contain persona-specific lens
    assert user_gen_z != user_skeptic
    assert gen_z.name in user_gen_z
    assert skeptic.name in user_skeptic
