"""
Tests for Virality Lab CLI.
"""

from virality_lab.cli import run_cli_pipeline


def test_cli_pipeline_with_text(capsys):
    """Verify CLI executes full pipeline with text caption."""
    run_cli_pipeline(
        input_path_or_text="5 AI study tools",
        platform="tiktok",
        media_type="short_video",
        optimize=True,
        mode="full",
    )
    captured = capsys.readouterr()
    assert "Running Virality Lab" in captured.out
    assert '"status": "completed"' in captured.out
    assert '"score"' in captured.out


def test_cli_pipeline_with_json_file(tmp_path, capsys):
    """Verify CLI executes pipeline reading from JSON input file."""
    json_file = tmp_path / "test_input.json"
    json_file.write_text('{"caption": "CLI JSON test", "platform": "instagram_reels", "media_type": "short_video"}')

    run_cli_pipeline(
        input_path_or_text=str(json_file),
        mode="analyze_only",
        optimize=False,
    )
    captured = capsys.readouterr()
    assert "Running Virality Lab" in captured.out
    assert '"content_profile"' in captured.out
