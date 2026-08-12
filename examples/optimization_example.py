"""
Example demonstration of the Content Optimization Engine (Part 6).
Demonstrates the full optimization loop:
Original Content -> Analysis -> Simulation -> Score & Diagnostics ->
Generate 3 Targeted Variants -> Simulate Variants -> Score Variants ->
Compare -> Guardrail Audit -> Select Winner.
"""

from pathlib import Path
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.config.env import load_env
from virality_lab.config.loader import create_default_agents, load_optimization_config, load_scoring_config
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.simulation import SimulationEngine
from virality_lab.optimizer.engine import OptimizationEngine
from virality_lab.optimizer.generator import MockContentOptimizer
from virality_lab.optimizer.schemas import OptimizationObjective
from virality_lab.scoring.engine import ViralityScoringEngine

load_env()


def run_optimization_demonstration():
    print("\n" + "=" * 75)
    print("  VIRALITY LAB -- CONTENT OPTIMIZATION ENGINE (PART 6 DEMO)")
    print("=" * 75 + "\n")

    # 1. Original Candidate Content
    content = Content(
        id="orig-college-ai-01",
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="5 AI tools every college student should know in 2026. Save this for later! #productivity #ai",
        transcript=(
            "Hey guys, today I want to talk about productivity in college. "
            "There are so many AI tools out there, but these 5 will help you study faster and organize notes."
        ),
        target_audience="College students and young professionals",
        goal="Maximize retention and shares",
    )

    # 2. Setup Pipeline Components
    agents = create_default_agents(agent_type="mock")
    sim_engine = SimulationEngine(agents=agents)
    scoring_config = load_scoring_config()
    opt_config = load_optimization_config()
    scoring_engine = ViralityScoringEngine(config=scoring_config)
    analyzer = LocalContentAnalyzer()

    # 3. Create OptimizationEngine with Mock Generator (Zero API key required)
    opt_engine = OptimizationEngine(
        simulation_engine=sim_engine,
        scoring_engine=scoring_engine,
        analyzer=analyzer,
        generator=MockContentOptimizer(),
        config=opt_config,
    )

    print(f"[*] Loaded Configuration:")
    print(f"    - Max Iterations:       {opt_config.max_iterations}")
    print(f"    - Variants/Iteration:   {opt_config.variants_per_iteration}")
    print(f"    - Minimum Improvement:  {opt_config.minimum_improvement} pts")
    print(f"    - Max Retention Drop:   {opt_config.guardrails.max_retention_drop_pct}%\n")

    print("[*] Running Optimization Loop...")
    result = opt_engine.optimize(
        content=content,
        objective=OptimizationObjective.OVERALL,
    )

    # 4. Render Ascii Report
    print("\n" + result.render_ascii_report())

    print("\n[SUCCESS] Part 6 Content Optimization Engine execution completed.\n")


if __name__ == "__main__":
    run_optimization_demonstration()
