"""
Virality Lab API Demonstration Client.
Demonstrates interacting with all Virality Lab endpoints via FastAPI TestClient (or requests/httpx).
"""

import json
from pathlib import Path
import sys
import time

# Ensure project root is in python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient

from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies


def run_api_demonstration():
    print("=" * 80)
    print("VIRALITY LAB API — END-TO-END CLIENT DEMONSTRATION")
    print("=" * 80)

    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    # 1. Health Check
    print("\n[1] Checking API Health (GET /health)...")
    res_health = client.get("/health")
    print(f"Status: {res_health.status_code}")
    print(json.dumps(res_health.json(), indent=2))

    # 2. Content Analysis
    print("\n[2] Content Intelligence Analysis (POST /api/analyze)...")
    content_payload = {
        "content": {
            "platform": "tiktok",
            "media_type": "short_video",
            "caption": "5 AI study tools every college student needs to stop studying all night",
            "transcript": "Stop wasting hours on notes. Here are 5 AI tools that cut study time in half.",
            "target_audience": "College & University students",
            "goal": "drive shares and saves",
        }
    }
    res_analyze = client.post("/api/analyze", json=content_payload)
    print(f"Status: {res_analyze.status_code}")
    profile_data = res_analyze.json()["content_profile"]
    print(f"Hook Strength: {profile_data['hook_analysis']['hook_strength']:.2f}")
    print(f"Pacing Score:  {profile_data['structure']['pacing_score']:.2f}")
    print(f"Dominant Mood: {profile_data['emotional_profile']['dominant_emotion']}")

    # 3. Audience Simulation
    print("\n[3] Simulating Audience Reactions (POST /api/simulate)...")
    res_sim = client.post("/api/simulate", json=content_payload)
    print(f"Status: {res_sim.status_code}")
    sim_data = res_sim.json()
    print(f"Simulated Personas: {sim_data['agent_count']} (Success Rate: {sim_data['success_rate']*100:.0f}%)")
    for r in sim_data["simulation_result"]["reactions"]:
        emotion = r.get("emotional_response") or r.get("dominant_emotion", "neutral")
        print(f" - {r['persona_name']:<18} Stop-Scroll: {r['stop_scroll']:.2f} | Share: {r['share_probability']:.2f} | Emotion: {emotion}")

    # 4. Virality Potential Scoring
    print("\n[4] Virality Potential Scoring & Diagnostics (POST /api/score)...")
    score_payload = {
        "simulation_result": sim_data["simulation_result"],
        "content_profile": profile_data,
        "platform": "tiktok",
    }
    res_score = client.post("/api/score", json=score_payload)
    score_data = res_score.json()
    print(f"Overall Virality Score: {score_data['overall_score']:.1f}/100")
    print(f"Strongest Dimension:    {score_data['strongest_dimension'].upper()}")
    print(f"Weakest Dimension:      {score_data['weakest_dimension'].upper()}")

    # 5. Content Optimization & Candidate Selection
    print("\n[5] Content Optimization Loop (POST /api/optimize)...")
    opt_payload = {
        "content": content_payload["content"],
        "objective": "overall",
        "max_iterations": 1,
    }
    res_opt = client.post("/api/optimize", json=opt_payload)
    opt_data = res_opt.json()
    print(f"Original Score:       {opt_data['original_score']:.1f}/100")
    print(f"Optimized Best Score: {opt_data['best_score']:.1f}/100 (+{opt_data['overall_improvement']:.1f} pts)")
    print(f"Best Variant Caption: \"{opt_data['best_content']['caption']}\"")

    # 6. Full End-to-End Synchronous Pipeline
    print("\n[6] Full Synchronous Pipeline (POST /api/run)...")
    full_payload = {
        "content": content_payload["content"],
        "optimization_enabled": True,
        "async_execution": False,
    }
    res_full = client.post("/api/run", json=full_payload)
    full_data = res_full.json()
    print(f"Run ID:        {full_data['run_id']}")
    print(f"Status:        {full_data['status'].upper()}")
    print(f"Initial Score: {full_data['score']['overall_score']:.1f}/100")
    print(f"Final Score:   {full_data['best_score']['overall_score']:.1f}/100")
    print(f"Improvement:   +{full_data['overall_improvement']:.1f} pts")

    print("\n" + "=" * 80)
    print("DEMONSTRATION COMPLETED SUCCESSFULLY")
    print("=" * 80)


if __name__ == "__main__":
    run_api_demonstration()
