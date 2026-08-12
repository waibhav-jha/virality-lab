"""
Tests for /api/analyze route.
"""

from fastapi.testclient import TestClient
from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies


def test_analyze_endpoint_valid_content():
    """Verify /api/analyze produces ContentProfile with text and hook metrics."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    payload = {
        "content": {
            "platform": "tiktok",
            "media_type": "short_video",
            "caption": "Are you still doing this manually? 5 AI tools for students",
            "transcript": "Stop wasting time writing notes. Here is how to automate it.",
        }
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "content_profile" in data
    profile = data["content_profile"]
    assert profile["text_analysis"]["word_count"] > 0
    assert profile["hook_analysis"]["hook_strength"] > 0
    assert profile["structure"]["hook"]["detected"] is True


def test_analyze_endpoint_validation_error():
    """Verify /api/analyze returns 422 with structured error on invalid payload."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    # Missing required 'content' field
    response = client.post("/api/analyze", json={})
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
