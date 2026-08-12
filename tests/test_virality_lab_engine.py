"""
Tests for ViralityLabEngine Facade and Pipeline Stage Progression.
"""

from virality_lab.config.app_config import AppConfig
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.engine.virality_lab_engine import (
    PipelineMode,
    ViralityLabEngine,
    generate_run_id,
)
from virality_lab.storage.runs import PipelineStage


def test_virality_lab_engine_generate_run_id():
    """Verify run ID follows 'vl_YYYYMMDD_xxxxxx' convention."""
    run_id = generate_run_id()
    assert run_id.startswith("vl_")
    parts = run_id.split("_")
    assert len(parts) == 3
    assert len(parts[1]) == 8  # YYYYMMDD


def test_virality_lab_engine_pipeline_modes():
    """Verify ViralityLabEngine executes analyze_only, simulate, score, and full modes."""
    config = AppConfig(simulation_mode="mock")
    engine = ViralityLabEngine.from_config(config)

    content = Content(
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        caption="5 AI study tools",
    )

    # 1. Analyze Only Mode
    res_analyze = engine.run(content, mode=PipelineMode.ANALYZE_ONLY)
    assert res_analyze["status"] == "completed"
    assert "content_profile" in res_analyze
    assert "simulation" not in res_analyze

    # 2. Simulate Mode
    res_sim = engine.run(content, mode=PipelineMode.SIMULATE)
    assert res_sim["status"] == "completed"
    assert "simulation" in res_sim
    assert "score" not in res_sim

    # 3. Score Mode
    res_score = engine.run(content, mode=PipelineMode.SCORE)
    assert res_score["status"] == "completed"
    assert "score" in res_score
    assert "optimization" not in res_score

    # 4. Full Mode
    res_full = engine.run(content, mode=PipelineMode.FULL, optimization_enabled=True)
    assert res_full["status"] == "completed"
    assert "optimization" in res_full
    assert "best_content" in res_full


def test_virality_lab_engine_progress_callback():
    """Verify progress callback is triggered across all pipeline stages."""
    config = AppConfig(simulation_mode="mock")
    engine = ViralityLabEngine.from_config(config)

    stages_seen = []

    def on_progress(stage: PipelineStage, progress: int, message: str) -> None:
        stages_seen.append(stage)

    content = Content(caption="Test progression")
    engine.run(content, mode=PipelineMode.FULL, progress_callback=on_progress)

    assert PipelineStage.ANALYZING in stages_seen
    assert PipelineStage.SIMULATING in stages_seen
    assert PipelineStage.SCORING in stages_seen
    assert PipelineStage.OPTIMIZING in stages_seen
    assert PipelineStage.SELECTING_WINNER in stages_seen
