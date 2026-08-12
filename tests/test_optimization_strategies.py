"""
Unit tests for modular optimization strategies.
"""

from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.optimizer.diagnostics_mapper import DiagnosticActionPlan
from virality_lab.optimizer.schemas import OptimizationObjective, OptimizationTarget
from virality_lab.optimizer.strategies import (
    CaptionOptimizationStrategy,
    CTAOptimizationStrategy,
    HookOptimizationStrategy,
    ShareabilityOptimizationStrategy,
    StructureOptimizationStrategy,
)
from tests.test_diagnostics_mapper import _build_test_score


def test_hook_strategy_builds_strict_prompt():
    """Verify HookOptimizationStrategy enforces factual and intent preservation rules."""
    strategy = HookOptimizationStrategy()
    content = Content(platform=Platform.TIKTOK, media_type=MediaType.SHORT_VIDEO, caption="Old hook here")
    score = _build_test_score()
    plan = DiagnosticActionPlan(
        target=OptimizationTarget.HOOK,
        priority=1,
        evidence="Stop-scroll rate is 45%",
        suggested_action="Sharpen opening hook",
        target_metric="stop_scroll",
    )

    sys_prompt, user_prompt = strategy.build_prompt(content, score, plan)
    assert "DO NOT fabricate statistics" in sys_prompt
    assert "ONLY modify the opening hook" in sys_prompt
    assert "DIAGNOSTIC EVIDENCE" in user_prompt
    assert "Old hook here" in user_prompt


def test_structure_strategy_handles_supported_media_types():
    """Verify StructureOptimizationStrategy handles video/text and rejects raw images."""
    strategy = StructureOptimizationStrategy()
    video_content = Content(media_type=MediaType.SHORT_VIDEO, caption="Video script")
    text_content = Content(media_type=MediaType.TEXT_POST, caption="Long text post")
    image_content = Content(media_type=MediaType.IMAGE, caption="Static photo")

    assert strategy.can_handle(video_content) is True
    assert strategy.can_handle(text_content) is True
    assert strategy.can_handle(image_content) is False


def test_caption_strategy_variant_creation():
    """Verify CaptionOptimizationStrategy creates valid immutable ContentVariant."""
    strategy = CaptionOptimizationStrategy()
    original = Content(id="orig-01", caption="Original caption")
    modified = original.model_copy(update={"id": "orig-01_var-01", "caption": "Restructured caption\n- Point 1\n- Point 2"})

    variant = strategy.create_variant(
        original_content=original,
        variant_id="var-01",
        modified_content=modified,
        changes=["Added structured bullet points"],
        reason="Low save rate",
    )

    assert variant.variant_id == "var-01"
    assert variant.optimization_target == OptimizationTarget.CAPTION
    assert len(variant.changes) == 1
    assert "Restructured" in variant.content.caption
