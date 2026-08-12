"""
Unit tests for deterministic explanation generation and diagnostics.
"""

from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.config import ScoringConfig
from virality_lab.scoring.engine import ViralityScoringEngine


def test_diagnostics_strongest_and_weakest_identification():
    """Verify diagnostics correctly identify strongest/weakest dimensions and personas."""
    engine = ViralityScoringEngine(config=ScoringConfig())

    # Persona 1: Loves retention and sharing
    r1 = Reaction(
        persona_id="p1",
        persona_name="Gen-Z Fan",
        content_id="c1",
        stop_scroll=0.95,
        watch_probability=0.90,
        completion_probability=0.90,
        like_probability=0.90,
        comment_probability=0.50,
        share_probability=0.95,
        save_probability=0.90,
        follow_probability=0.80,
        emotional_response="excited",
        reasoning="Fantastic video",
        strengths=["High energy hook"],
        weaknesses=[],
    )

    # Persona 2: Hates everything, very low scores
    r2 = Reaction(
        persona_id="p2",
        persona_name="Strict Critic",
        content_id="c1",
        stop_scroll=0.20,
        watch_probability=0.10,
        completion_probability=0.10,
        like_probability=0.05,
        comment_probability=0.80,
        share_probability=0.05,
        save_probability=0.05,
        follow_probability=0.01,
        emotional_response="skeptical",
        reasoning="Unsubstantiated claims",
        strengths=[],
        weaknesses=["Unsubstantiated hype claims"],
    )

    sim = SimulationResult(content_id="c1", reactions=[r1, r2], total_agents=2)
    score = engine.score(sim)

    assert score.diagnostics.strongest_persona == "Gen-Z Fan"
    assert score.diagnostics.weakest_persona == "Strict Critic"
    assert any("Gen-Z Fan" in pos for pos in score.explanation.positive_drivers)
    assert any("Strict Critic" in neg for neg in score.explanation.negative_drivers)
    assert "Unsubstantiated hype claims" in score.diagnostics.consensus_weaknesses
