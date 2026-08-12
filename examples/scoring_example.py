"""
Example demonstration of the Virality Scoring & Audience Intelligence Engine (Part 5).
Shows deterministic scoring, audience agreement, polarization, diagnostics, and full report rendering.
"""

from datetime import datetime, timezone
from pathlib import Path
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from virality_lab.config.env import load_env
from virality_lab.config.loader import load_scoring_config
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.engine import ViralityScoringEngine

load_env()


def run_scoring_demonstration():
    print("\n" + "=" * 75)
    print("  VIRALITY LAB -- AUDIENCE INTELLIGENCE & SCORING ENGINE (PART 5 DEMO)")
    print("=" * 75 + "\n")

    # 1. Candidate Content
    content = Content(
        id="demo-reel-2026-prod",
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="I replaced 3 hours of daily college assignments with these 5 AI tools in 2026. Save this for finals! #ai #productivity #student",
    )

    # 2. Realistic Simulated Audience Reactions (from Multi-Persona Evaluation)
    reactions = [
        Reaction(
            persona_id="p-genz-01",
            persona_name="Gen-Z Student",
            content_id=content.id,
            stop_scroll=0.85,
            watch_probability=0.75,
            completion_probability=0.70,
            like_probability=0.80,
            comment_probability=0.35,
            share_probability=0.85,
            save_probability=0.92,
            follow_probability=0.45,
            emotional_response="curious",
            reasoning="The opening hook promises high utility. The 3 AI tools breakdown is clear and actionable. Time saved demonstration is very shareable.",
            strengths=["Strong opening value promise", "Clear and actionable tool breakdown", "Visually engaging time-saved demo"],
            weaknesses=["Fast speaking rate makes it slightly difficult to follow notes without pausing"],
        ),
        Reaction(
            persona_id="p-casual-02",
            persona_name="Casual Scroller",
            content_id=content.id,
            stop_scroll=0.85,
            watch_probability=0.65,
            completion_probability=0.55,
            like_probability=0.60,
            comment_probability=0.15,
            share_probability=0.25,
            save_probability=0.55,
            follow_probability=0.20,
            emotional_response="curious",
            reasoning="The opening hook catches attention immediately. However, lengthy tool breakdown causes slight drop-off before the end.",
            strengths=["Immediate value promise in first 2 seconds", "Resonates with productivity and study hacks"],
            weaknesses=["Delayed payoff causes drop-off before the 3rd tool", "Text overlays are slightly overwhelming for low attention span"],
        ),
        Reaction(
            persona_id="p-creator-03",
            persona_name="Content Creator",
            content_id=content.id,
            stop_scroll=0.85,
            watch_probability=0.75,
            completion_probability=0.70,
            like_probability=0.75,
            comment_probability=0.40,
            share_probability=0.65,
            save_probability=0.80,
            follow_probability=0.50,
            emotional_response="curious",
            reasoning="Opening hook effectively promises a valuable solution. Specific tool workflows resonate with creator productivity.",
            strengths=["Hook structure effectively stops feed scroll", "Clear use cases for each tool"],
            weaknesses=["Repeated phrasing feels like a standard template"],
        ),
        Reaction(
            persona_id="p-skeptic-04",
            persona_name="Skeptic",
            content_id=content.id,
            stop_scroll=0.65,
            watch_probability=0.55,
            completion_probability=0.45,
            like_probability=0.20,
            comment_probability=0.60,
            share_probability=0.15,
            save_probability=0.40,
            follow_probability=0.10,
            emotional_response="skeptical",
            reasoning="Claim of saving 10 hours seems exaggerated and lacks concrete verification. Will comment to challenge the hype.",
            strengths=["Opening addresses a common real problem", "Concise format"],
            weaknesses=["Saving 10 hours claim seems exaggerated", "Feels like affiliate engagement bait"],
        ),
        Reaction(
            persona_id="p-expert-05",
            persona_name="Niche Expert",
            content_id=content.id,
            stop_scroll=0.85,
            watch_probability=0.75,
            completion_probability=0.75,
            like_probability=0.70,
            comment_probability=0.45,
            share_probability=0.45,
            save_probability=0.85,
            follow_probability=0.35,
            emotional_response="curious",
            reasoning="Opening hook leverages a value promise effectively. Tool synthesis demonstrates good understanding, though topic is familiar.",
            strengths=["Accurate tool utility categorization", "Clear concise narrative breakdown"],
            weaknesses=["Slightly clickbaity hook formulation"],
        ),
    ]

    simulation_result = SimulationResult(
        content_id=content.id,
        reactions=reactions,
        total_agents=5,
        execution_time_ms=250.0,
    )

    # 3. Load Configurable Scoring Weights (from config/scoring.yaml)
    config = load_scoring_config()
    print(f"[*] Loaded Scoring Configuration from config/scoring.yaml")
    print(f"    - Platform:            {content.platform.value}")
    print(f"    - Base Component Wts:  {config.component_weights}")
    print(f"    - Active Platform Wts: {config.get_component_weights(content.platform)}")

    # 4. Execute Deterministic Scoring Engine
    scoring_engine = ViralityScoringEngine(config=config)
    virality_score = scoring_engine.score(
        simulation_result=simulation_result,
        platform=content.platform,
    )

    # 5. Render Full Visual Report
    print("\n" + virality_score.render_ascii_report())

    print("\n[SUCCESS] Part 5 Scoring & Audience Intelligence execution completed.\n")


if __name__ == "__main__":
    run_scoring_demonstration()
