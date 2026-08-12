"""
Command Line Interface (CLI) for Virality Lab.
Allows local command-line runs, analysis, and starting the FastAPI server.
"""

import argparse
import json
import os
from pathlib import Path
import sys
from typing import Optional

from virality_lab.config.app_config import AppConfig
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.engine.virality_lab_engine import PipelineMode, ViralityLabEngine
from virality_lab.optimizer.schemas import OptimizationObjective


def run_cli_pipeline(
    input_path_or_text: str,
    platform: str = "tiktok",
    media_type: str = "short_video",
    optimize: bool = True,
    objective: str = "overall",
    mode: str = "full",
) -> None:
    """Execute pipeline via CLI using ViralityLabEngine."""
    config = AppConfig.from_env()
    engine = ViralityLabEngine.from_config(config)

    # Check if input is a JSON file
    if os.path.isfile(input_path_or_text) and input_path_or_text.endswith(".json"):
        with open(input_path_or_text, "r", encoding="utf-8") as f:
            data = json.load(f)
        content = Content(
            id=data.get("id"),
            platform=Platform(data.get("platform", platform)),
            media_type=MediaType(data.get("media_type", media_type)),
            caption=data.get("caption", ""),
            transcript=data.get("transcript"),
            media_path=data.get("media_path"),
            metadata=data.get("metadata", {}),
        )
    elif os.path.isfile(input_path_or_text):
        content = Content(
            platform=Platform(platform),
            media_type=MediaType(media_type),
            media_path=input_path_or_text,
            caption=Path(input_path_or_text).stem,
        )
    else:
        content = Content(
            platform=Platform(platform),
            media_type=MediaType(media_type),
            caption=input_path_or_text,
        )

    print(f"\n[*] Running Virality Lab ({mode.upper()} mode, Mode: {config.simulation_mode})...")
    result = engine.run(
        content=content,
        mode=PipelineMode(mode),
        objective=OptimizationObjective(objective),
        optimization_enabled=optimize,
    )

    print(json.dumps(result, indent=2))


def serve_api(host: str = "127.0.0.1", port: int = 8000, reload: bool = False) -> None:
    """Start the FastAPI server via uvicorn."""
    import uvicorn
    print(f"\n[*] Starting Virality Lab FastAPI server on http://{host}:{port} ...")
    uvicorn.run("virality_lab.api.app:app", host=host, port=port, reload=reload)


def main() -> None:
    """CLI argument parsing entry point."""
    parser = argparse.ArgumentParser(
        prog="virality_lab",
        description="Virality Lab — AI-Powered Content Simulation & Optimization Engine",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: run
    run_parser = subparsers.add_parser("run", help="Run end-to-end pipeline on content")
    run_parser.add_argument("input", help="Text caption or path to JSON/media file")
    run_parser.add_argument("--platform", default="tiktok", choices=["tiktok", "instagram_reels", "youtube_shorts", "twitter_x"])
    run_parser.add_argument("--media-type", default="short_video", choices=["short_video", "image", "text_post", "carousel"])
    run_parser.add_argument("--no-optimize", action="store_true", help="Disable optimization stage")
    run_parser.add_argument("--objective", default="overall", choices=["overall", "reach", "retention", "shares", "comments", "saves"])
    run_parser.add_argument("--mode", default="full", choices=["analyze_only", "simulate", "score", "optimize", "full"])

    # Command: analyze
    analyze_parser = subparsers.add_parser("analyze", help="Run content intelligence analysis only")
    analyze_parser.add_argument("input", help="Text caption or path to file")
    analyze_parser.add_argument("--platform", default="tiktok")

    # Command: serve
    serve_parser = subparsers.add_parser("serve", help="Start FastAPI web server")
    serve_parser.add_argument("--host", default="127.0.0.1")
    serve_parser.add_argument("--port", type=int, default=8000)
    serve_parser.add_argument("--reload", action="store_true")

    args = parser.parse_args()

    if args.command == "run":
        run_cli_pipeline(
            input_path_or_text=args.input,
            platform=args.platform,
            media_type=args.media_type,
            optimize=not args.no_optimize,
            objective=args.objective,
            mode=args.mode,
        )
    elif args.command == "analyze":
        run_cli_pipeline(
            input_path_or_text=args.input,
            platform=args.platform,
            mode="analyze_only",
            optimize=False,
        )
    elif args.command == "serve":
        serve_api(host=args.host, port=args.port, reload=args.reload)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
