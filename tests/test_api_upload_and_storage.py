"""
Tests for Media Storage, Upload API, file validation, and path traversal defenses.
"""

import io
import os
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

from virality_lab.api.app import create_app
from virality_lab.api.dependencies import reset_dependencies
from virality_lab.config.app_config import AppConfig
from virality_lab.storage.media import LocalMediaStorage


def test_upload_valid_image():
    """Verify /api/upload accepts valid PNG/JPG image."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    file_bytes = b"\x89PNG\r\n\x1a\n" + b"dummy image payload"
    files = {"file": ("test_thumbnail.png", io.BytesIO(file_bytes), "image/png")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "file_path" in data
    assert os.path.exists(data["file_path"])
    assert data["filename"] == "test_thumbnail.png"
    assert data["size_bytes"] == len(file_bytes)


def test_upload_unsupported_file_type():
    """Verify /api/upload returns 415 on forbidden executable/script extensions."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    file_bytes = b"malicious executable payload"
    files = {"file": ("exploit.exe", io.BytesIO(file_bytes), "application/octet-stream")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 415
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "UNSUPPORTED_MEDIA_TYPE"


def test_upload_empty_file():
    """Verify /api/upload returns 400 on 0-byte upload."""
    reset_dependencies()
    app = create_app()
    client = TestClient(app)

    files = {"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")}
    response = client.post("/api/upload", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data


def test_media_storage_path_traversal_defense(tmp_path):
    """Verify LocalMediaStorage rejects path traversal filenames."""
    config = AppConfig(media_storage_dir=tmp_path)
    storage = LocalMediaStorage(config=config)

    # Attempt path traversal
    saved_path = storage.save("../../../traversal.mp4", b"fake mp4 video bytes", content_type="video/mp4")
    resolved = Path(saved_path).resolve()
    # Must reside safely inside storage_dir
    assert str(resolved).startswith(str(tmp_path.resolve()))
