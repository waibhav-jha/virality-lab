"""
Unit tests for VideoProcessor module.
"""

import os
from pathlib import Path
import pytest
from virality_lab.analyzer.video_processor import VideoProcessor


def test_video_processor_timestamp_calculation():
    """Verify calculated representative timestamps for standard durations."""
    processor = VideoProcessor()

    # 18.4s video
    stamps = processor.calculate_frame_timestamps(18.4)
    labels = [s["label"] for s in stamps]
    assert "0s" in labels
    assert "1s" in labels
    assert "2s" in labels
    assert "3s" in labels
    assert "25%" in labels
    assert "50%" in labels
    assert "75%" in labels
    assert "100%" in labels

    # Very short video (e.g. 2s)
    short_stamps = processor.calculate_frame_timestamps(2.0)
    assert len(short_stamps) >= 1
    assert short_stamps[0]["timestamp"] == 0.0


def test_video_processor_missing_file_handling():
    """Verify FileNotFoundError is raised cleanly for nonexistent files."""
    processor = VideoProcessor()

    with pytest.raises(FileNotFoundError):
        processor.get_metadata("non_existent_video_path.mp4")

    with pytest.raises(FileNotFoundError):
        processor.extract_frames("non_existent_video_path.mp4")

    with pytest.raises(FileNotFoundError):
        processor.extract_audio("non_existent_video_path.mp4")


def test_video_processor_fallback_with_dummy_file(tmp_path):
    """Verify metadata and frame extraction fallback works cleanly on a mock local file."""
    dummy_video = tmp_path / "sample_test_video.mp4"
    dummy_video.write_bytes(b"dummy video data for metadata test")

    processor = VideoProcessor()
    meta = processor.get_metadata(str(dummy_video))

    assert meta.file_size_bytes > 0
    assert meta.duration_sec is not None
    assert meta.aspect_ratio is not None

    frames = processor.extract_frames(str(dummy_video), output_dir=str(tmp_path / "frames"))
    assert len(frames) >= 4
    assert frames[0].label == "0s"
