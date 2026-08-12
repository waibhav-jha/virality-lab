"""
Virality Lab - Multimodal Content Analysis Layer Demonstration (Part 2 Demo).

This script demonstrates how raw social media content (video metadata, caption,
dialogue hook, and transcript) is transformed into a validated, structured ContentProfile.

Runs offline and deterministically without API keys.
"""

import os
from pathlib import Path
import sys

# Ensure root directory is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from virality_lab.analyzer.mock_analyzer import MockContentAnalyzer
from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.core.content import Content, MediaType, Platform

# Ensure UTF-8 output encoding for cross-platform terminal compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def main() -> None:
    print("=" * 75)
    print("  VIRALITY LAB - MULTIMODAL CONTENT ANALYSIS LAYER (PART 2 DEMO)")
    print("  [Note: Running in DETERMINISTIC DEMONSTRATION MODE - Zero API keys required]")
    print("=" * 75)

    # 1. Instantiate Sample Raw Content
    sample_content = Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="I replaced 3 hours of daily college assignments with these 5 AI tools in 2026. Save this for finals! #ai #productivity #student",
        transcript="If you are still doing your college research manually in 2026, stop. Here are 3 AI tools that will save you 10 hours this week. Tool number one turns any lecture into interactive flashcards.",
        target_audience="College students, tech enthusiasts, and productivity seekers",
        goal="Drive high save-rate and organic shares among students",
        metadata={"duration_sec": 18.4, "hook_duration_sec": 3.0},
    )

    print("\n[1] RAW INPUT CONTENT INGESTION:")
    print(f"    Platform:        {sample_content.platform.value}")
    print(f"    Media Type:      {sample_content.media_type.value}")
    print(f"    Caption:         \"{sample_content.caption}\"")
    print(f"    Transcript:      \"{sample_content.transcript[:80]}...\"")

    # 2. Run Content Analysis Pipeline
    print("\n[2] EXECUTING CONTENT ANALYZER PIPELINE (Local & Heuristic Modules)...")
    analyzer = MockContentAnalyzer()
    profile = analyzer.analyze(sample_content)

    # 3. Display Extracted Content Profile
    print("\n" + "=" * 75)
    print("  STRUCTURED CONTENT PROFILE (Layer 1 Observation & Layer 2 Signals)")
    print("=" * 75)

    print("\n-- BASIC MEDIA & METADATA (Layer 1)")
    print(f"  * Platform:         {profile.media_info.platform.value}")
    print(f"  * Media Type:       {profile.media_info.media_type.value}")
    print(f"  * Duration:         {profile.media_info.duration_sec} sec")
    print(f"  * Dimensions:       {profile.media_info.width}x{profile.media_info.height} (Aspect: {profile.media_info.aspect_ratio})")
    print(f"  * Frame Rate (FPS): {profile.media_info.fps}")
    print(f"  * Codec:            {profile.media_info.codec}")

    print("\n-- TEXT & CAPTION ANALYSIS (Layer 1 & 2)")
    t = profile.text_analysis
    print(f"  * Words / Chars:    {t.word_count} words / {t.char_count} characters across {t.sentence_count} sentences")
    print(f"  * Readability Ease: {t.readability_score} / 100")
    print(f"  * Hashtags / Tags:  {', '.join(t.hashtags)}")
    print(f"  * CTA Detected:     {t.cta_present} (Type: {t.cta_type})")
    print(f"  * Style Categories: Educational: {t.is_educational:.2f} | Informational: {t.is_informational:.2f} | Personal: {t.is_personal:.2f}")

    print("\n-- HOOK ANALYSIS (First 0-3 Seconds)")
    h = profile.hook_analysis
    print(f"  * Hook Text:        \"{h.hook_text}\"")
    print(f"  * Hook Type:        {h.hook_type.value}")
    print(f"  * Hook Strength:    {h.hook_strength:.2f} / 1.00")
    print(f"  * Curiosity Gap:    {h.curiosity:.2f} / 1.00")
    print(f"  * Clarity:          {h.clarity:.2f} / 1.00")
    print(f"  * Specificity:      {h.specificity:.2f} / 1.00")
    print(f"  * Novelty:          {h.novelty:.2f} / 1.00")

    print("\n-- NARRATIVE CONTENT STRUCTURE")
    s = profile.structure
    print(f"  * [0.0s - {s.hook.end_sec}s] Hook:        {s.hook.summary} (Conf: {s.hook.confidence:.2f})")
    print(f"  * [{s.context.start_sec}s - {s.context.end_sec}s] Context:     {s.context.summary} (Conf: {s.context.confidence:.2f})")
    print(f"  * [{s.development.start_sec}s - {s.development.end_sec}s] Development: {s.development.summary} (Conf: {s.development.confidence:.2f})")
    print(f"  * [{s.payoff.start_sec}s - {s.payoff.end_sec}s] Payoff:      {s.payoff.summary} (Conf: {s.payoff.confidence:.2f})")
    print(f"  * [{s.cta.start_sec}s - {s.cta.end_sec}s] CTA:         {s.cta.summary} (Conf: {s.cta.confidence:.2f})")
    print(f"  * Narrative Pacing Score: {s.pacing_score:.2f} / 1.00")

    print("\n-- VISUAL & THUMBNAIL CHARACTERISTICS")
    v = profile.visual_analysis
    print(f"  * Faces Present:    {v.faces_present} (Count: {v.face_count})")
    print(f"  * Text Overlay:     {v.text_present}")
    print(f"  * Detected Objects: {', '.join(v.detected_objects)}")
    print(f"  * Scene Changes:    {v.scene_changes}")
    print(f"  * Visual Novelty:   {v.visual_novelty:.2f} | Motion Level: {v.motion_level:.2f}")
    if v.visual_hook:
        print(f"  * First Frame Clarity: {v.visual_hook.first_frame_clarity:.2f} | Subject Visibility: {v.visual_hook.subject_visibility:.2f}")

    print("\n-- AUDIO & TRANSCRIPT ANALYSIS")
    a = profile.audio_analysis
    tr = profile.transcript_analysis
    print(f"  * Audio Stream:     Present ({'Speech & Music detected' if a.speech_present else 'No speech'})")
    print(f"  * Speaking Rate:    {tr.speaking_rate_wpm} WPM (Words per minute)")
    print(f"  * Key Topics:       {', '.join(tr.key_topics)}")
    print(f"  * Repeated Phrases: {', '.join(tr.repeated_phrases)}")

    print("\n-- INTRINSIC ENGAGEMENT SIGNALS (Layer 2 Content Properties)")
    e = profile.engagement_features
    print(f"  * Curiosity Signal:      {e.curiosity_signal:.2f}  [Triggers watch continuation]")
    print(f"  * Relatability Signal:    {e.relatability_signal:.2f}  [Triggers emotional resonance]")
    print(f"  * Usefulness Signal:      {e.usefulness_signal:.2f}  [Triggers bookmarks/saves]")
    print(f"  * Shareability Signal:    {e.shareability_signal:.2f}  [Triggers peer-forwarding]")
    print(f"  * Saveability Signal:     {e.saveability_signal:.2f}  [Triggers algorithmic replay]")

    print("\n" + "=" * 75)
    print("  CAPABILITY AUDIT LOG")
    print("=" * 75)
    for cap_name, cap in profile.capabilities.items():
        print(f"  [+] {cap_name:<22}: Available={cap.available:<5} | Confidence={cap.confidence:.2f} | Source={cap.source}")

    print("\n[SUCCESS] Content profile extracted successfully. Ready for Audience Simulation (Part 3).")


if __name__ == "__main__":
    main()
