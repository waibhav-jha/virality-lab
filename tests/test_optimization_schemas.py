"""
Unit tests for optimization schemas and data models.
"""

import pytest
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.optimizer.schemas import (
    ContentVariant,
    EvaluatedVariant,
    OptimizationComparison,
    OptimizationIteration,
    OptimizationObjective,
    OptimizationResult,
    OptimizationTarget,
)
from virality_lab.scoring.schemas import (
    AudienceAgreement,
    AudienceSummary,
    ComponentScores,
    ScoreConfidence,
    ScoreDiagnostics,
    ScoreExplanation,
    ViralityScore,
)


def _make_dummy_virality_score(overall: float, retention: float = 60.0, sharing: float = 50.0) -> ViralityScore:
    comps = ComponentScores(retention=retention, sharing=sharing, engagement=60.0, conversion=40.0)
    agreement = AudienceAgreement(agreement_score=0.8, polarization_score=0.2, level="high", interpretation="Good consensus")
    summary = AudienceSummary(
        mean_score=overall,
        median_score=overall,
        min_score=overall - 5,
        max_score=overall + 5,
        std_dev=3.5,
        agreement=agreement,
        strongest_persona="Gen-Z Student",
        weakest_persona="Skeptic",
        persona_scores={},
    )
    return ViralityScore(
        overall_score=overall,
        components=comps,
        audience=summary,
        diagnostics=ScoreDiagnostics(
            strongest_dimension="retention",
            weakest_dimension="conversion",
            strongest_persona="Gen-Z Student",
            weakest_persona="Skeptic",
        ),
        explanation=ScoreExplanation(
            positive_drivers=["Strong hook"],
            negative_drivers=["Weak CTA"],
            audience_verdict="Solid engagement",
        ),
        confidence=ScoreConfidence(
            simulation_coverage=1.0,
            evaluated_agents=5,
            expected_agents=5,
            uncertainty_level="low",
        ),
    )


def test_content_variant_immutability():
    """Verify ContentVariant maintains parent_content_id and creates immutable content."""
    original = Content(id="orig-01", caption="Original caption")
    variant_content = original.model_copy(update={"id": "orig-01_var-01", "caption": "Optimized caption"})

    variant = ContentVariant(
        variant_id="var-01",
        parent_content_id=original.id,
        optimization_target=OptimizationTarget.HOOK,
        strategy_name="HookOptimizationStrategy",
        changes=["Replaced hook"],
        reason="Low stop-scroll",
        content=variant_content,
        target_metric="stop_scroll",
    )

    assert variant.variant_id == "var-01"
    assert variant.parent_content_id == "orig-01"
    assert original.caption == "Original caption"
    assert variant.content.caption == "Optimized caption"
    assert variant.optimization_target == OptimizationTarget.HOOK


def test_optimization_comparison_deltas():
    """Verify OptimizationComparison computes accurate deltas."""
    orig_s = _make_dummy_virality_score(60.0, retention=50.0, sharing=40.0)
    var_s = _make_dummy_virality_score(72.0, retention=65.0, sharing=55.0)

    comparison = OptimizationComparison(
        original_score=orig_s.overall_score,
        variant_score=var_s.overall_score,
        absolute_change=12.0,
        relative_change=20.0,
        component_changes={"retention": 15.0, "sharing": 15.0},
        audience_changes={"Gen-Z Student": 10.0},
        agreement_change=0.0,
    )

    assert comparison.absolute_change == 12.0
    assert comparison.relative_change == 20.0
    assert comparison.component_changes["retention"] == 15.0
    assert comparison.is_regression is False


def test_optimization_result_ascii_report():
    """Verify OptimizationResult renders clean ASCII report."""
    orig_c = Content(id="orig-01", caption="Test original")
    orig_s = _make_dummy_virality_score(50.0)
    best_s = _make_dummy_virality_score(65.0)

    res = OptimizationResult(
        original_content=orig_c,
        original_score=orig_s,
        history=[],
        best_variant=None,
        best_content=orig_c,
        best_score=best_s,
        overall_improvement=15.0,
        summary="Optimization improved score by 15 points.",
    )

    report = res.render_ascii_report()
    assert "VIRALITY LAB -- CONTENT OPTIMIZATION REPORT" in report
    assert "BASELINE SCORE:       50.0 / 100" in report
    assert "OPTIMIZED SCORE:      65.0 / 100" in report
    assert "+15.0 points" in report
