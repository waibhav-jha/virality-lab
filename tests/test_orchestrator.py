"""
Unit and integration tests for the ViralityEngine top-level orchestrator.
"""

import pytest

from virality_lab.agents.audience_agent import LLMAudienceAgent
from virality_lab.agents.mock_agent import MockAudienceAgent
from virality_lab.agents.personas import (
    create_casual_scroller,
    create_content_creator,
    create_gen_z_student,
    create_niche_expert,
    create_skeptic,
)
from virality_lab.config.loader import create_default_agents
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.scoring import ScoringEngine, ViralityScoreBreakdown
from virality_lab.core.simulation import SimulationEngine
from virality_lab.engine.aggregator import ReactionAggregator
from virality_lab.engine.orchestrator import ViralityEngine, ViralityEngineResult
from virality_lab.llm.mock_provider import MockLLMProvider


def test_orchestrator_end_to_end():
    """Test full pipeline execution: Content -> Simulation -> Aggregation -> Score."""
    agents = create_default_agents(agent_type="mock")
    sim_engine = SimulationEngine(agents=agents)
    aggregator = ReactionAggregator()
    scoring = ScoringEngine()

    virality_engine = ViralityEngine(
        simulation_engine=sim_engine,
        aggregator=aggregator,
        scoring_engine=scoring,
    )

    content = Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="POV: You discovered this AI productivity stack in 2026.",
        transcript="I cut my daily workload by 4 hours using these 3 tools.",
        target_audience="Young professionals and students",
        goal="Drive shares and saves",
    )

    result = virality_engine.run(content)

    assert isinstance(result, ViralityEngineResult)
    assert result.content.id == content.id
    assert len(result.simulation_result.reactions) == 5
    assert result.aggregate_reaction.total_reactions == 5
    assert isinstance(result.score_breakdown, ViralityScoreBreakdown)
    assert 0.0 <= result.score_breakdown.overall_score <= 100.0
    assert 0.0 <= result.score_breakdown.stop_scroll_score <= 100.0


def test_orchestrator_content_analyzer_hook():
    """Test registering a Content Analyzer extension hook."""
    agents = [MockAudienceAgent(create_gen_z_student())]
    sim_engine = SimulationEngine(agents=agents)
    virality_engine = ViralityEngine(simulation_engine=sim_engine)

    def dummy_analyzer(c: Content) -> Content:
        c.metadata["hook_type"] = "curiosity_gap"
        c.metadata["visual_energy"] = "high"
        return c

    virality_engine.register_content_analyzer(dummy_analyzer)

    content = Content(caption="Test hook analyzer")
    result = virality_engine.run(content)

    assert result.content.metadata.get("hook_type") == "curiosity_gap"
    assert result.content.metadata.get("visual_energy") == "high"


def test_orchestrator_with_llm_agents_and_mock_provider():
    """Test pipeline using LLMAudienceAgents backed by MockLLMProvider."""
    provider = MockLLMProvider()
    personas = [create_gen_z_student(), create_skeptic()]
    llm_agents = [LLMAudienceAgent(p, provider=provider) for p in personas]

    sim_engine = SimulationEngine(agents=llm_agents)
    virality_engine = ViralityEngine(simulation_engine=sim_engine)

    content = Content(
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        caption="Is this the craziest AI tool of 2026?",
    )

    result = virality_engine.run(content)

    assert len(result.simulation_result.reactions) == 2
    assert len(provider.call_history) == 2
    assert result.score_breakdown.overall_score > 0
