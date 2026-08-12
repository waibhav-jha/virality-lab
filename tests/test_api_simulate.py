"""
Tests for /api/simulate route.
"""

from fastapi.testclient import TestClient
from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies


def test_simulate_endpoint_all_personas():
    """Verify /api/simulate executes audience simulation across all default personas."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    payload = {
        "content": {
            "platform": "instagram_reels",
            "media_type": "short_video",
            "caption": "Secret productivity hack for college students",
        }
    }

    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["agent_count"] == 5
    assert data["success_rate"] == 1.0
    assert "simulation_result" in data
    assert len(data["simulation_result"]["reactions"]) == 5


def test_simulate_endpoint_filtered_personas():
    """Verify /api/simulate respects persona subset filter."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    payload = {
        "content": {
            "platform": "tiktok",
            "caption": "Test post",
        },
        "personas": ["Gen-Z Student", "Skeptic"],
    }

    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["agent_count"] == 2
    names = [r["persona_name"] for r in data["simulation_result"]["reactions"]]
    assert "Gen-Z Student" in names
    assert "Skeptic" in names
