"""
Utility to load environment variables from .env and .env.example files.
"""

from pathlib import Path
import os


def load_env(env_path: Path | None = None) -> None:
    """
    Load key-value pairs from .env (or .env.example) into os.environ.
    Does not override existing environment variables if already set.
    """
    if env_path is None:
        root_dir = Path(__file__).resolve().parent.parent.parent
        dot_env = root_dir / ".env"
        dot_env_example = root_dir / ".env.example"
        target_path = dot_env if dot_env.is_file() else (dot_env_example if dot_env_example.is_file() else None)
    else:
        target_path = env_path if env_path.is_file() else None

    if not target_path or not target_path.exists():
        return

    try:
        with open(target_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key and val and key not in os.environ:
                        os.environ[key] = val
    except Exception:
        pass
