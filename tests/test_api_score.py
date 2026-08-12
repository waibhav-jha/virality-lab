"""
Tests for /api/score route.
"""

from fastapi.testclient import TestClient
from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies


def test_score_endpoint_calculates_virality_breakdown():
    """Verify /api/score converts simulation result into full ViralityScore."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    # 1. Run simulation first to get valid SimulationResult payload
    sim_res = client.post(
        "/api/simulate",
        json={"content": {"caption": "How to double your productivity in 3 steps"}},
    ).json()

    score_payload = {
        "simulation_result": sim_res["simulation_result"],
        "platform": "tiktok",
    }

    response = client.post("/api/score", json=score_payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["overall_score"] <= 100
    assert "virality_score" in data
    score_obj = data["virality_score"]
    assert "retention" in score_obj["components"]
    assert "sharing" in score_obj["components"]
    assert "audience" in score_obj
    assert data["strongest_dimension"] is not None
