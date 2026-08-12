"""
Temporary Media Storage & Validation.
Handles local caching of uploaded media files, safe filename generation,
MIME and extension validation, and automatic cleanup.
"""

from abc import ABC, abstractmethod
import mimetypes
import os
from pathlib import Path
import re
import time
from typing import Optional
import uuid

from virality_lab.config.app_config import AppConfig


class MediaStorage(ABC):
    """Abstract media storage interface."""

    @abstractmethod
    def save(self, filename: str, content: bytes, content_type: Optional[str] = None) -> str:
        """Save file bytes and return local file path or URI."""
        pass

    @abstractmethod
    def get(self, file_path: str) -> Optional[bytes]:
        """Retrieve raw file bytes by path."""
        pass

    @abstractmethod
    def delete(self, file_path: str) -> bool:
        """Delete file by path."""
        pass

    @abstractmethod
    def cleanup(self, max_age_seconds: int = 3600) -> int:
        """Clean up files older than max_age_seconds. Returns number of files removed."""
        pass


class LocalMediaStorage(MediaStorage):
    """
    Local filesystem implementation of MediaStorage with strict security validation.
    """

    def __init__(self, config: Optional[AppConfig] = None) -> None:
        self.config = config or AppConfig.from_env()
        self.storage_dir = Path(self.config.media_storage_dir).resolve()
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, filename: str, content: bytes, content_type: Optional[str] = None) -> None:
        """
        Validate file extension, size, and MIME type.
        Raises ValueError on security or validation violation.
        """
        # 1. Size check
        max_bytes = self.config.max_upload_size_mb * 1024 * 1024
        if len(content) > max_bytes:
            raise ValueError(
                f"File size ({len(content) / (1024*1024):.1f}MB) exceeds maximum limit of {self.config.max_upload_size_mb}MB."
            )

        if len(content) == 0:
            raise ValueError("Uploaded file is empty (0 bytes).")

        # 2. Extension check
        ext = Path(filename).suffix.lower()
        if not ext or ext not in self.config.allowed_media_extensions:
            raise ValueError(
                f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(self.config.allowed_media_extensions)}"
            )

        # 3. MIME type check
        inferred_mime, _ = mimetypes.guess_type(filename)
        effective_mime = content_type or inferred_mime

        if effective_mime and effective_mime.lower() not in [m.lower() for m in self.config.allowed_mime_types]:
            raise ValueError(
                f"Unsupported media MIME type '{effective_mime}'. Allowed types: {', '.join(self.config.allowed_mime_types)}"
            )

    def save(self, filename: str, content: bytes, content_type: Optional[str] = None) -> str:
        """
        Validate and save media content safely.
        Returns the absolute string path to the saved file.
        """
        self.validate_file(filename=filename, content=content, content_type=content_type)

        ext = Path(filename).suffix.lower()
        clean_name = re.sub(r"[^a-zA-Z0-9_\-]", "", Path(filename).stem)[:24]
        safe_filename = f"{clean_name}_{uuid.uuid4().hex[:8]}{ext}"

        dest_path = (self.storage_dir / safe_filename).resolve()

        # Prevent path traversal attacks
        if not str(dest_path).startswith(str(self.storage_dir)):
            raise ValueError("Security violation: Invalid path destination.")

        with open(dest_path, "wb") as f:
            f.write(content)

        return str(dest_path)

    def get(self, file_path: str) -> Optional[bytes]:
        """Read file bytes securely."""
        target = Path(file_path).resolve()
        if not str(target).startswith(str(self.storage_dir)) or not target.is_file():
            return None
        with open(target, "rb") as f:
            return f.read()

    def delete(self, file_path: str) -> bool:
        """Delete media file securely."""
        target = Path(file_path).resolve()
        if str(target).startswith(str(self.storage_dir)) and target.is_file():
            target.unlink()
            return True
        return False

    def cleanup(self, max_age_seconds: int = 3600) -> int:
        """Delete files older than max_age_seconds."""
        now = time.time()
        deleted_count = 0
        for item in self.storage_dir.iterdir():
            if item.is_file():
                age = now - item.stat().st_mtime
                if age > max_age_seconds:
                    item.unlink()
                    deleted_count += 1
        return deleted_count
