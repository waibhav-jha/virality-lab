"""
Central Application Configuration.
Manages global environment settings, simulation modes, storage directories,
upload limits, and LLM orchestration settings.
"""

import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field

from virality_lab.config.env import load_env

# Ensure .env is loaded
load_env()


class AppConfig(BaseModel):
    """Centralized application settings for Virality Lab API and Orchestrator."""

    environment: str = Field(default="development", description="Application environment ('development', 'test', 'production').")
    simulation_mode: str = Field(
        default="mock",
        description="Audience simulation execution mode: 'mock' (offline deterministic) or 'real'/'llm' (live LLM agents).",
    )
    llm_provider: str = Field(default="nvidia", description="Default LLM provider when running in live mode ('nvidia', 'openai', 'gemini', 'anthropic', 'ollama').")
    llm_model: Optional[str] = Field(default=None, description="Optional custom LLM model name.")
    
    # Upload and Media Security
    max_upload_size_mb: int = Field(default=50, description="Maximum permitted media upload size in megabytes.")
    allowed_media_extensions: list[str] = Field(
        default_factory=lambda: [".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov"],
        description="Allowed file extensions for media upload.",
    )
    allowed_mime_types: list[str] = Field(
        default_factory=lambda: [
            "image/png",
            "image/jpeg",
            "image/webp",
            "video/mp4",
            "video/quicktime",
        ],
        description="Allowed MIME types for media upload.",
    )
    media_storage_dir: Path = Field(
        default_factory=lambda: Path(os.getenv("MEDIA_STORAGE_DIR", ".media_temp")),
        description="Temporary directory for uploaded media.",
    )

    # Simulation & Optimization Defaults
    max_personas: int = Field(default=20, description="Maximum allowed audience persona count per simulation.")
    optimization_iterations: int = Field(default=1, description="Default iterations for content optimization.")
    variants_per_iteration: int = Field(default=3, description="Default number of variants generated per iteration.")
    timeout_seconds: int = Field(default=120, description="Execution timeout for complete simulation and optimization runs.")

    # External config paths
    scoring_config_path: Optional[Path] = Field(default=None)
    optimization_config_path: Optional[Path] = Field(default=None)

    @classmethod
    def from_env(cls) -> "AppConfig":
        """Construct AppConfig reading from environment variables with fallback defaults."""
        env_mode = os.getenv("SIMULATION_MODE", "mock").lower()
        if env_mode in ("real", "llm", "live"):
            simulation_mode = "real"
        else:
            simulation_mode = "mock"

        max_mb = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
        timeout = int(os.getenv("PIPELINE_TIMEOUT_SECONDS", "120"))
        llm_prov = os.getenv("LLM_PROVIDER", os.getenv("DEFAULT_LLM_PROVIDER", "nvidia")).lower()
        llm_mod = os.getenv("LLM_MODEL", None)
        media_dir = Path(os.getenv("MEDIA_STORAGE_DIR", ".media_temp"))

        return cls(
            environment=os.getenv("ENVIRONMENT", "development"),
            simulation_mode=simulation_mode,
            llm_provider=llm_prov,
            llm_model=llm_mod,
            max_upload_size_mb=max_mb,
            media_storage_dir=media_dir,
            timeout_seconds=timeout,
        )
