"""
Demonstration: Real LLM-Powered Audience Persona Simulation.
Transforms Content -> ContentProfile -> 5 LLMAudienceAgents -> Structured Reactions.
Works deterministically offline in Mock mode (zero keys) or live with OpenAI/Gemini/Anthropic/Ollama.
"""

from pathlib import Path
import os
import sys

# Ensure repository root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from virality_lab.analyzer.mock_analyzer import MockContentAnalyzer
from virality_lab.config.loader import load_default_personas
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.simulation import SimulationEngine
from virality_lab.agents.audience_agent import LLMAudienceAgent
from virality_lab.llm.providers import get_llm_provider


def main() -> None:
    print("=" * 75)
    print("  VIRALITY LAB - AUDIENCE PERSONA BEHAVIORAL SIMULATION (PART 4 DEMO)")
    
    # Check configured provider
    provider_name = os.environ.get("VIRALITY_LAB_LLM_PROVIDER", "mock").lower()
    model_name = os.environ.get("VIRALITY_LAB_LLM_MODEL")
    provider = get_llm_provider(provider_type=provider_name, model_name=model_name)
    
    if provider_name == "mock":
        print("  [MODE: DETERMINISTIC MOCK LLM PROVIDER — Zero API keys required]")
    else:
        print(f"  [MODE: LIVE LLM PROVIDER — {provider_name.upper()} ({getattr(provider, 'model_name', 'default')})]")
    print("=" * 75)

    # 1. Create Raw Social Media Content
    print("\n[1] INGESTING CANDIDATE SOCIAL CONTENT:")
    content = Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="I replaced 3 hours of daily college assignments with these 5 AI tools in 2026. Save this for finals! #ai #productivity #student",
        transcript="If you are still doing your college research manually in 2026, stop. Here are 3 AI tools that will save you 10 hours this semester. First, NotebookLM for source synthesis. Second, Perplexity for citations. Third, Claude for code debugging. Save this post before finals week.",
        metadata={"duration_sec": 18.4, "fps": 30.0},
    )
    print(f"    Platform:        {content.platform.value}")
    print(f"    Media Type:      {content.media_type.value}")
    print(f"    Caption:         \"{content.caption}\"")
    print(f"    Spoken Dialogue: \"{content.transcript[:80]}...\"")

    # 2. Extract Multimodal ContentProfile
    print("\n[2] EXTRACTING STRUCTURED CONTENT INTELLIGENCE (Layer 1 & Layer 2)...")
    analyzer = MockContentAnalyzer()
    profile = analyzer.analyze(content)
    content.profile = profile
    print(f"    [+] Hook Analyzed:       \"{profile.hook.hook_text}\" (Type: {profile.hook.hook_type.value}, Strength: {profile.hook.hook_strength:.2f})")
    print(f"    [+] Engagement Signals:  Curiosity={profile.engagement_signals.curiosity_signal:.2f} | Novelty={profile.engagement_signals.novelty_signal:.2f} | Usefulness={profile.engagement_signals.usefulness_signal:.2f}")

    # 3. Initialize 5 LLMAudienceAgents
    print("\n[3] INITIALIZING 5 LLM AUDIENCE AGENTS ACROSS DIVERSE AUDIENCE SEGMENTS...")
    personas = load_default_personas()
    agents = []
    for persona in personas:
        agent = LLMAudienceAgent(persona=persona, provider=provider)
        agents.append(agent)
        print(f"    [+] Agent Ready: {persona.name:<18} (Attention: {persona.attention_span.value:<13} | Trend Sensitivity: {persona.trend_sensitivity:.2f})")

    # 4. Execute Multi-Agent Behavioral Simulation
    print(f"\n[4] DISPATCHING CONTENT PROFILE TO {len(agents)} SIMULATED PERSONAS...")
    engine = SimulationEngine(agents=agents)
    result = engine.run(content, concurrent=False)

    # 5. Display Structured Results
    print("\n" + "=" * 75)
    print("  SIMULATION RESULTS -- INDIVIDUAL PERSONA BEHAVIORAL REACTIONS")
    print("=" * 75)
    print(f"{'PERSONA':<18} | {'STOP SCROLL':<11} | {'WATCH':<7} | {'SHARE':<7} | {'SAVE':<7} | {'EMOTION':<12}")
    print("-" * 75)
    for r in result.reactions:
        print(f"{r.persona_name:<18} | {r.stop_scroll:<11.2f} | {r.watch_probability:<7.2f} | {r.share_probability:<7.2f} | {r.save_probability:<7.2f} | {r.emotional_response:<12}")

    print("\n" + "=" * 75)
    print("  EVIDENCE-GROUNDED REASONING & FRICTION AUDIT")
    print("=" * 75)
    for r in result.reactions:
        print(f"\n>> [{r.persona_name.upper()}] (Emotional Response: {r.emotional_response.upper()}):")
        print(f"   Reasoning: \"{r.reasoning}\"")
        if r.strengths:
            print(f"   [*] Strengths: {', '.join(r.strengths)}")
        if r.weaknesses:
            print(f"   [!] Friction / Weaknesses: {', '.join(r.weaknesses)}")

    print("\n" + "=" * 75)
    print("  AUDIENCE AGGREGATE SUMMARY (Raw Behavioral Averages)")
    print("=" * 75)
    avg_stop = sum(r.stop_scroll for r in result.reactions) / len(result.reactions)
    avg_watch = sum(r.watch_probability for r in result.reactions) / len(result.reactions)
    avg_share = sum(r.share_probability for r in result.reactions) / len(result.reactions)
    avg_save = sum(r.save_probability for r in result.reactions) / len(result.reactions)
    print(f"  * Total Successful Evaluations: {result.total_reactions} / {len(agents)}")
    print(f"  * Mean Stop Scroll Probability: {avg_stop * 100:.1f}%")
    print(f"  * Mean Watch Retention:         {avg_watch * 100:.1f}%")
    print(f"  * Mean Share Probability:       {avg_share * 100:.1f}%")
    print(f"  * Mean Save / Bookmark Utility: {avg_save * 100:.1f}%")
    print(f"  * Execution Latency:            {result.metadata.get('duration_ms', 0):.1f} ms")
    print("=" * 75)
    print("\n[SUCCESS] Part 4 Audience Agent simulation completed cleanly.")


if __name__ == "__main__":
    main()
