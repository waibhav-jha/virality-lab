"""
Tests for /api/run endpoint, background job polling, and run management.
"""

import time
from fastapi.testclient import TestClient
from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies


def test_run_endpoint_synchronous_full_pipeline():
    """Verify /api/run with async_execution=False executes full pipeline synchronously."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    payload = {
        "content": {
            "platform": "tiktok",
            "media_type": "short_video",
            "caption": "Are you still doing this manually? 5 AI tools",
        },
        "optimization_enabled": True,
        "async_execution": False,
    }

    response = client.post("/api/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "run_id" in data
    assert data["run_id"].startswith("vl_")
    assert "content_profile" in data
    assert "simulation" in data
    assert "score" in data
    assert "optimization" in data
    assert "best_content" in data


def test_run_endpoint_optimization_disabled():
    """Verify /api/run with optimization_enabled=False stops after scoring."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    payload = {
        "content": {
            "platform": "instagram_reels",
            "caption": "Check out this productivity guide",
        },
        "optimization_enabled": False,
        "async_execution": False,
    }

    response = client.post("/api/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["simulation"] is not None
    assert data["score"] is not None
    assert data.get("optimization") is None


def test_run_endpoint_async_and_status_polling():
    """Verify /api/run with async_execution=True returns immediately and supports polling."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    payload = {
        "content": {
            "platform": "tiktok",
            "caption": "Background job test post",
        },
        "optimization_enabled": True,
        "async_execution": True,
    }

    # 1. Initiate async run
    init_res = client.post("/api/run", json=payload)
    assert init_res.status_code == 200
    init_data = init_res.json()
    run_id = init_data["run_id"]
    assert run_id.startswith("vl_")

    # 2. Poll run status
    status_res = client.get(f"/api/runs/{run_id}")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["run_id"] == run_id
    assert status_data["status"] in ["queued", "processing", "completed"]


def test_get_run_status_not_found():
    """Verify /api/runs/{invalid_id} returns 404 with structured error."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    response = client.get("/api/runs/vl_nonexistent_999999")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"


def test_list_runs_endpoint():
    """Verify /api/runs returns list of recent runs."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    # Trigger a synchronous run
    client.post(
        "/api/run",
        json={"content": {"caption": "Test run 1"}, "async_execution": False},
    )

    response = client.get("/api/runs?limit=10")
    assert response.status_code == 200
    runs = response.json()
    assert len(runs) >= 1
    assert "run_id" in runs[0]
    assert "status" in runs[0]
