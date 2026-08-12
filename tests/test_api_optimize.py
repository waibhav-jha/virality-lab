"""
Tests for /api/optimize route.
"""

from fastapi.testclient import TestClient
from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies


def test_optimize_endpoint_generates_variants_and_winner():
    """Verify /api/optimize generates candidate variants and selects winning content."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    payload = {
        "content": {
            "platform": "tiktok",
            "media_type": "short_video",
            "caption": "5 AI tools for students",
        },
        "objective": "overall",
        "max_iterations": 1,
    }

    response = client.post("/api/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "optimization_result" in data
    assert "best_content" in data
    assert data["best_score"] >= data["original_score"]
    assert "history" in data["optimization_result"]
    assert len(data["optimization_result"]["history"]) == 1
