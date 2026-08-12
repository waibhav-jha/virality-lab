"""
Unit tests for the SimulationEngine, fault tolerance, and multi-agent execution.
"""

import pytest

from virality_lab.agents.base_agent import AudienceAgent
from virality_lab.agents.mock_agent import MockAudienceAgent
from virality_lab.agents.personas import (
    create_casual_scroller,
    create_content_creator,
    create_gen_z_student,
    create_niche_expert,
    create_skeptic,
)
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.persona import Persona
from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationEngine, SimulationResult


class BrokenFailingAgent(AudienceAgent):
    """An agent that deliberately crashes during evaluation for testing resilience."""

    def evaluate(self, content: Content) -> Reaction:
        raise RuntimeError("Simulated network timeout or internal LLM crash")


def test_simulation_multi_agent_execution():
    """Test standard simulation across 5 persona agents."""
    personas = [
        create_gen_z_student(),
        create_casual_scroller(),
        create_content_creator(),
        create_skeptic(),
        create_niche_expert(),
    ]
    agents = [MockAudienceAgent(p) for p in personas]

    content = Content(
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        caption="Stop scrolling: 3 AI tools that will save you 10 hours a week.",
        transcript="If you're still writing reports manually in 2026, here are 3 tools you need.",
        target_audience="College students and creators",
        goal="Drive shares and bookmarks",
    )

    engine = SimulationEngine(agents=agents)
    result = engine.run(content)

    assert isinstance(result, SimulationResult)
    assert result.content_id == content.id
    assert len(result.reactions) == 5
    assert len(result.failed_agents) == 0
    assert result.total_evaluated == 5

    # Check individual reactions preserved
    gen_z_reaction = result.get_reaction_by_persona("Gen-Z Student")
    assert gen_z_reaction is not None
    assert gen_z_reaction.stop_scroll > 0.0
    assert gen_z_reaction.share_probability > 0.0
    assert len(gen_z_reaction.reasoning) > 0


def test_simulation_fault_isolation():
    """Test that one failing agent does NOT crash the simulation or corrupt other results."""
    good_agent_1 = MockAudienceAgent(create_gen_z_student())
    broken_agent = BrokenFailingAgent(create_skeptic())
    good_agent_2 = MockAudienceAgent(create_content_creator())

    content = Content(caption="Test content for error handling")

    engine = SimulationEngine(agents=[good_agent_1, broken_agent, good_agent_2])
    result = engine.run(content, fail_fast=False)

    # 2 succeeded, 1 failed
    assert len(result.reactions) == 2
    assert len(result.failed_agents) == 1
    assert result.failed_agents[0]["persona"] == "Skeptic"
    assert "Simulated network timeout" in result.failed_agents[0]["error"]

    # Verify both good reactions exist
    assert result.get_reaction_by_persona("Gen-Z Student") is not None
    assert result.get_reaction_by_persona("Content Creator") is not None


def test_simulation_fail_fast():
    """Test that fail_fast=True immediately raises when an agent fails."""
    good_agent = MockAudienceAgent(create_gen_z_student())
    broken_agent = BrokenFailingAgent(create_skeptic())

    content = Content(caption="Test content")
    engine = SimulationEngine(agents=[good_agent, broken_agent])

    with pytest.raises(RuntimeError, match="Simulated network timeout"):
        engine.run(content, fail_fast=True)


def test_simulation_empty_agents():
    """Test that running with no agents raises ValueError."""
    content = Content(caption="Test")
    engine = SimulationEngine(agents=[])

    with pytest.raises(ValueError, match="No audience agents registered"):
        engine.run(content)


def test_simulation_invalid_content_type():
    """Test that passing non-Content object raises TypeError."""
    agent = MockAudienceAgent(create_gen_z_student())
    engine = SimulationEngine(agents=[agent])

    with pytest.raises(TypeError, match="Expected instance of Content"):
        engine.run("not a content object")  # type: ignore
