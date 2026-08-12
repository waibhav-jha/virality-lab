"""
Tests for Health Check and OpenAPI documentation.
"""

from fastapi.testclient import TestClient
from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies


def test_health_check_endpoint():
    """Verify /health returns operational status and simulation mode."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "Virality Lab API"
    assert "simulation_mode" in data
    assert "version" in data


def test_openapi_schema_endpoint():
    """Verify /openapi.json generates valid OpenAPI spec."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert data["info"]["title"] == "Virality Lab API"
    assert "/api/analyze" in data["paths"]
    assert "/api/simulate" in data["paths"]
    assert "/api/score" in data["paths"]
    assert "/api/optimize" in data["paths"]
    assert "/api/run" in data["paths"]
    assert "/api/upload" in data["paths"]
