"""
Unit and integration tests for ViralityScoringEngine.
Verifies mathematical accuracy, platform adaptation, determinism, and failure handling.
"""

import pytest
from virality_lab.core.content import Platform
from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.config import ScoringConfig
from virality_lab.scoring.engine import ViralityScoringEngine
from virality_lab.scoring.schemas import ViralityScore


def _create_persona_reaction(
    name: str,
    stop: float,
    watch: float,
    comp: float,
    share: float,
    like: float,
    comment: float,
    save: float,
    follow: float,
) -> Reaction:
    return Reaction(
        persona_id=f"id-{name}",
        persona_name=name,
        content_id="content-score-test",
        stop_scroll=stop,
        watch_probability=watch,
        completion_probability=comp,
        like_probability=like,
        comment_probability=comment,
        share_probability=share,
        save_probability=save,
        follow_probability=follow,
        emotional_response="curious",
        reasoning="Evaluated behavioral reaction.",
        strengths=["Clear concise delivery", "Actionable value"],
        weaknesses=["Slightly generic hook"],
    )


def test_virality_scoring_engine_perfect_and_zero_bounds():
    """Verify scoring engine respects 0.0 and 100.0 boundaries."""
    engine = ViralityScoringEngine(config=ScoringConfig())

    # 1. Perfect 1.0 probabilities across all metrics
    perfect_reaction = _create_persona_reaction("Gen-Z", 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
    sim_perfect = SimulationResult(content_id="c-perf", reactions=[perfect_reaction], total_agents=1)
    score_perf = engine.score(sim_perfect)

    assert isinstance(score_perf, ViralityScore)
    assert score_perf.overall_score == 100.0
    assert score_perf.components.retention == 100.0
    assert score_perf.components.sharing == 100.0
    assert score_perf.components.engagement == 100.0
    assert score_perf.components.conversion == 100.0

    # 2. Zero probabilities
    zero_reaction = _create_persona_reaction("Skeptic", 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
    sim_zero = SimulationResult(content_id="c-zero", reactions=[zero_reaction], total_agents=1)
    score_zero = engine.score(sim_zero)

    assert score_zero.overall_score == 0.0
    assert score_zero.components.retention == 0.0


def test_virality_scoring_determinism():
    """Verify score(A) == score(A) given identical inputs."""
    engine = ViralityScoringEngine(config=ScoringConfig())
    r1 = _create_persona_reaction("P1", 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.6, 0.2)
    r2 = _create_persona_reaction("P2", 0.6, 0.5, 0.4, 0.3, 0.2, 0.5, 0.3, 0.1)

    sim = SimulationResult(content_id="c-det", reactions=[r1, r2], total_agents=2)

    score_1 = engine.score(sim)
    score_2 = engine.score(sim)

    assert score_1.overall_score == score_2.overall_score
    assert score_1.components.model_dump() == score_2.components.model_dump()
    assert score_1.audience.agreement.agreement_score == score_2.audience.agreement.agreement_score


def test_platform_modifiers_impact_on_score():
    """Verify platform modifiers appropriately adjust the overall score."""
    engine = ViralityScoringEngine(config=ScoringConfig())
    
    # High retention (1.0) but low sharing (0.0)
    r = _create_persona_reaction("Audience", stop=1.0, watch=1.0, comp=1.0, share=0.0, like=0.5, comment=0.5, save=0.5, follow=0.5)
    sim = SimulationResult(content_id="c-plat", reactions=[r], total_agents=1)

    # TikTok (retention weight = 0.40) vs Generic (retention weight = 0.35)
    score_tiktok = engine.score(sim, platform=Platform.TIKTOK)
    score_generic = engine.score(sim, platform=None)

    # TikTok should score higher because of higher retention weighting
    assert score_tiktok.overall_score > score_generic.overall_score


def test_partial_agent_failure_coverage():
    """Verify scoring handles partial simulation failure gracefully with coverage tracking."""
    engine = ViralityScoringEngine(config=ScoringConfig())
    r1 = _create_persona_reaction("P1", 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.6, 0.2)

    # 4 expected, only 1 succeeded
    sim = SimulationResult(content_id="c-fail", reactions=[r1], total_agents=4)
    score = engine.score(sim)

    assert score.confidence.simulation_coverage == 0.25
    assert score.confidence.evaluated_agents == 1
    assert score.confidence.expected_agents == 4
    assert score.confidence.uncertainty_level == "high"


def test_scoring_empty_reactions():
    """Verify scoring empty simulation result produces clean zero score without crashing."""
    engine = ViralityScoringEngine(config=ScoringConfig())
    sim = SimulationResult(content_id="c-empty", reactions=[], total_agents=5)
    score = engine.score(sim)

    assert score.overall_score == 0.0
    assert score.confidence.simulation_coverage == 0.0
    assert score.confidence.evaluated_agents == 0
