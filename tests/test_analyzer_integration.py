"""
Integration tests for Content Analyzer with Part 1 Simulation and Virality Engine.
"""

from virality_lab.analyzer.mock_analyzer import MockContentAnalyzer
from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.config.loader import create_default_agents
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.simulation import SimulationEngine
from virality_lab.engine.aggregator import ReactionAggregator
from virality_lab.engine.orchestrator import ViralityEngine


def test_full_pipeline_with_content_analyzer_integration():
    """
    Verify complete workflow:
    Raw Content -> ContentAnalyzer -> ContentProfile -> SimulationEngine -> Aggregator -> ViralityEngine
    """
    raw_content = Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="I replaced 3 hours of college homework with these 5 AI tools. #ai #study",
        transcript="If you are still doing your assignments manually in 2026, stop. Here are 3 tools.",
    )

    # 1. Initialize Analyzer
    analyzer = MockContentAnalyzer()
    profile = analyzer.analyze(raw_content)
    assert isinstance(profile, ContentProfile)

    # 2. Attach profile to content and check prompt serialization
    content_with_profile = raw_content.model_copy(update={"profile": profile})
    prompt_context = content_with_profile.to_prompt_context()

    assert "Opening Hook" in prompt_context
    assert "Curiosity Signal" in prompt_context
    assert "Novelty Signal" in prompt_context

    # 3. Execute Simulation Engine
    agents = create_default_agents(agent_type="mock")
    sim_engine = SimulationEngine(agents=agents)
    sim_result = sim_engine.run(content_with_profile)

    assert sim_result.total_reactions == len(agents)
    assert sim_result.success_rate == 1.0

    # 4. Aggregator
    aggregator = ReactionAggregator()
    agg_result = aggregator.aggregate(sim_result)
    assert agg_result.total_reactions == len(agents)


def test_virality_engine_with_registered_analyzer():
    """Verify that ViralityEngine automatically enriches Content with ContentProfile when analyzer is registered."""
    raw_content = Content(
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        caption="POV: When you discover the cheat code for college assignments #students",
        transcript="Stop scrolling. Here is how I cut 3 hours of studying into 15 minutes.",
    )

    agents = create_default_agents(agent_type="mock")
    sim_engine = SimulationEngine(agents=agents)
    virality_engine = ViralityEngine(simulation_engine=sim_engine)

    # Register LocalContentAnalyzer
    local_analyzer = LocalContentAnalyzer()
    virality_engine.register_content_analyzer(local_analyzer)

    result = virality_engine.run(raw_content)

    assert result.content.profile is not None
    assert isinstance(result.content.profile, ContentProfile)
    assert result.content.profile.hook_analysis.hook_type.value is not None
    assert result.simulation_result.total_reactions == len(agents)
    assert result.score_breakdown.virality_potential >= 0.0
