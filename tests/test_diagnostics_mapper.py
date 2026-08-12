"""
Unit tests for DiagnosticsMapper mapping behavioral weaknesses to prioritized actions.
"""

from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.optimizer.diagnostics_mapper import DiagnosticsMapper
from virality_lab.optimizer.schemas import OptimizationObjective, OptimizationTarget
from virality_lab.scoring.schemas import (
    AudienceAgreement,
    AudienceSummary,
    ComponentScores,
    MetricDistribution,
    ScoreConfidence,
    ScoreDiagnostics,
    ScoreExplanation,
    ViralityScore,
)


def _build_test_score(
    retention: float = 45.0,
    sharing: float = 40.0,
    engagement: float = 60.0,
    conversion: float = 30.0,
    stop_scroll_mean: float = 0.45,
    share_mean: float = 0.35,
    completion_mean: float = 0.40,
) -> ViralityScore:
    comps = ComponentScores(retention=retention, sharing=sharing, engagement=engagement, conversion=conversion)
    agreement = AudienceAgreement(agreement_score=0.7, polarization_score=0.3, level="moderate", interpretation="Consensus")
    summary = AudienceSummary(
        mean_score=45.0,
        median_score=45.0,
        min_score=35.0,
        max_score=55.0,
        std_dev=7.0,
        agreement=agreement,
        strongest_persona="Gen-Z Student",
        weakest_persona="Skeptic",
        persona_scores={},
    )
    raw = {
        "stop_scroll": MetricDistribution(mean=stop_scroll_mean, median=stop_scroll_mean, std_dev=0.1, min_val=0.3, max_val=0.6),
        "share_probability": MetricDistribution(mean=share_mean, median=share_mean, std_dev=0.1, min_val=0.2, max_val=0.5),
        "completion_probability": MetricDistribution(mean=completion_mean, median=completion_mean, std_dev=0.1, min_val=0.2, max_val=0.6),
        "save_probability": MetricDistribution(mean=0.50, median=0.50, std_dev=0.1, min_val=0.3, max_val=0.7),
        "follow_probability": MetricDistribution(mean=0.25, median=0.25, std_dev=0.1, min_val=0.1, max_val=0.4),
    }
    return ViralityScore(
        overall_score=45.0,
        components=comps,
        audience=summary,
        diagnostics=ScoreDiagnostics(
            strongest_dimension="engagement",
            weakest_dimension="retention",
            strongest_persona="Gen-Z Student",
            weakest_persona="Skeptic",
        ),
        explanation=ScoreExplanation(
            positive_drivers=[],
            negative_drivers=["Low stop scroll"],
            audience_verdict="High drop-off",
        ),
        confidence=ScoreConfidence(
            simulation_coverage=1.0,
            evaluated_agents=5,
            expected_agents=5,
            uncertainty_level="low",
        ),
        raw_metrics=raw,
    )


def test_diagnostics_mapper_low_retention_targets_hook():
    """Verify weak retention and stop-scroll trigger HOOK as top priority."""
    mapper = DiagnosticsMapper()
    content = Content(platform=Platform.TIKTOK, media_type=MediaType.SHORT_VIDEO, caption="Test post")
    score = _build_test_score(retention=45.0, stop_scroll_mean=0.45)

    plans = mapper.map_diagnostics_to_plans(content, score, objective=OptimizationObjective.OVERALL)
    assert len(plans) > 0
    assert plans[0].target == OptimizationTarget.HOOK
    assert plans[0].priority == 1
    assert "Stop-scroll rate" in plans[0].evidence


def test_diagnostics_mapper_shares_objective_promotes_shareability():
    """Verify OptimizationObjective.SHARES elevates SHAREABILITY priority."""
    mapper = DiagnosticsMapper()
    content = Content(platform=Platform.INSTAGRAM_REELS, media_type=MediaType.SHORT_VIDEO, caption="Test reel")
    score = _build_test_score(retention=75.0, sharing=50.0, stop_scroll_mean=0.80, share_mean=0.45)

    plans = mapper.map_diagnostics_to_plans(content, score, objective=OptimizationObjective.SHARES)
    share_plan = next((p for p in plans if p.target == OptimizationTarget.SHAREABILITY), None)
    assert share_plan is not None
    assert share_plan.priority == 1


def test_diagnostics_mapper_low_completion_targets_structure():
    """Verify low completion probability triggers STRUCTURE optimization."""
    mapper = DiagnosticsMapper()
    content = Content(platform=Platform.TIKTOK, media_type=MediaType.SHORT_VIDEO, caption="Test video")
    score = _build_test_score(completion_mean=0.35)

    plans = mapper.map_diagnostics_to_plans(content, score)
    struct_plan = next((p for p in plans if p.target == OptimizationTarget.STRUCTURE), None)
    assert struct_plan is not None
    assert "drops off before payoff" in struct_plan.evidence
