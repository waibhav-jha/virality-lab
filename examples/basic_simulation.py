"""
Basic Simulation Example for Virality Lab.
Demonstrates running a simulated audience test across 5 personas on social media content.
Runs 100% offline with zero API keys required.
"""

import sys
from pathlib import Path

# Add project root to sys.path so example can be executed directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from virality_lab.config.loader import create_default_agents, load_default_personas
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.scoring import ScoringEngine
from virality_lab.core.simulation import SimulationEngine
from virality_lab.engine.aggregator import ReactionAggregator
from virality_lab.engine.orchestrator import ViralityEngine


def main() -> None:
    print("=" * 75)
    print("  VIRALITY LAB - PRE-PUBLICATION CONTENT SIMULATION ENGINE (PART 1 DEMO)")
    print("  [Note: Running in DETERMINISTIC MOCK MODE - Zero API keys required]")
    print("=" * 75)

    # Set stdout encoding if needed
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    # 1. Define the Candidate Content Item
    content = Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="I replaced 3 hours of daily college assignments with these 5 AI tools in 2026.",
        transcript=(
            "If you're still doing your college research manually in 2026, stop. "
            "Here are the exact 5 AI tools I used this semester to cut my workload in half. "
            "Tool number 1 is..."
        ),
        target_audience="College students, tech enthusiasts, and productivity seekers",
        goal="Drive high shareability and bookmarks/saves",
        metadata={
            "initial_hook_duration_sec": 2.5,
            "visual_style": "Fast-paced screen recording with face overlay",
        },
    )

    print("\n[1] TEST CONTENT INITIALIZED:")
    print(f"    Platform:        {content.platform.value.upper()}")
    print(f"    Media Type:      {content.media_type.value}")
    print(f"    Caption:         \"{content.caption}\"")
    print(f"    Dialogue Hook:   \"{content.transcript[:75]}...\"")
    print(f"    Target Audience: {content.target_audience}")

    # 2. Load Configured Personas & Initialize Audience Agents
    print("\n[2] LOADING AUDIENCE PERSONAS FROM CONFIG (config/personas.yaml)...")
    agents = create_default_agents(agent_type="mock")
    for agent in agents:
        print(f"    [+] Persona Loaded: {agent.name:<18} (Attention: {agent.persona.attention_span.value:<13} | Trend Sensitivity: {agent.persona.trend_sensitivity:.2f})")

    # 3. Assemble the Virality Lab Pipeline
    sim_engine = SimulationEngine(agents=agents)
    aggregator = ReactionAggregator()
    scoring = ScoringEngine()
    virality_engine = ViralityEngine(
        simulation_engine=sim_engine,
        aggregator=aggregator,
        scoring_engine=scoring,
    )

    # 4. Execute the Simulation
    print("\n[3] RUNNING AUDIENCE SIMULATION ACROSS 5 INDEPENDENT PERSONAS...")
    result = virality_engine.run(content)

    # 5. Display Structured Persona Predictions & Reasoning
    print("\n" + "=" * 75)
    print(f"  SIMULATION COMPLETE -- INDIVIDUAL PERSONA BEHAVIORAL PREDICTIONS [MOCK]")
    print("=" * 75)
    print(f"{'PERSONA':<18} | {'STOP SCROLL':<11} | {'WATCH':<7} | {'SHARE':<7} | {'SAVE':<7} | {'EMOTION':<12}")
    print("-" * 75)
    for reaction in result.simulation_result.reactions:
        print(
            f"{reaction.persona_name:<18} | "
            f"{reaction.stop_scroll:<11.2f} | "
            f"{reaction.watch_probability:<7.2f} | "
            f"{reaction.share_probability:<7.2f} | "
            f"{reaction.save_probability:<7.2f} | "
            f"{reaction.emotional_response:<12}"
        )

    print("\n" + "=" * 75)
    print("  QUALITATIVE PERSONA REASONING & WEAKNESS DETECTION")
    print("=" * 75)
    for reaction in result.simulation_result.reactions:
        print(f"\n>> [{reaction.persona_name}] (Emotion: {reaction.emotional_response.upper()}):")
        print(f"   Reasoning: \"{reaction.reasoning}\"")
        if reaction.weaknesses:
            print(f"   [!] Weakness: {reaction.weaknesses[0]}")
        if reaction.strengths:
            print(f"   [*] Strength: {reaction.strengths[0]}")

    # 6. Display Statistical Audience Aggregate & Virality Score
    print("\n" + "=" * 75)
    print("  AUDIENCE-LEVEL AGGREGATE METRICS")
    print("=" * 75)
    agg = result.aggregate_reaction
    print(f"  * Total Evaluated Personas: {agg.total_reactions}")
    print(f"  * Mean Stop-Scroll Rate:    {agg.mean_stop_scroll:.1%} (Range: {agg.min_stop_scroll:.2f} - {agg.max_stop_scroll:.2f})")
    print(f"  * Mean Watch Retention:     {agg.mean_watch_probability:.1%}")
    print(f"  * Mean Completion Rate:     {agg.mean_completion_probability:.1%}")
    print(f"  * Mean Shareability:        {agg.mean_share_probability:.1%} (Range: {agg.min_share_probability:.2f} - {agg.max_share_probability:.2f})")
    print(f"  * Mean Save / Bookmark:     {agg.mean_save_probability:.1%}")
    print(f"  * Mean Comment Likelihood:  {agg.mean_comment_probability:.1%}")

    print("\n" + "=" * 75)
    print("  FINAL SIMULATED VIRALITY SCORE POTENTIAL")
    print("=" * 75)
    print(result.score_breakdown.render_ascii_bars())
    print("=" * 75)
    print("\n[SUCCESS] Simulation completed cleanly without API dependencies.")


if __name__ == "__main__":
    main()
