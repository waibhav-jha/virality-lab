"""
Content Profile Serializer.
Converts structured ContentProfile models and Content items into concise,
token-budgeted, LLM-friendly context for audience persona reasoning.
"""

from typing import Any, Dict, Optional
from virality_lab.analyzer.schemas import (
    BasicMediaInfo,
    ContentProfile,
    ContentStructure,
    EmotionalProfile,
    EngagementFeatures,
    HookAnalysis,
    TextAnalysis,
    TranscriptAnalysis,
    VisualAnalysis,
)
from virality_lab.core.content import Content, Platform


class ContentProfileSerializer:
    """
    Serializes Content and ContentProfile models into structured, clean Markdown
    optimized for LLM prompt context while strictly respecting a token/word budget.
    """

    def __init__(
        self,
        max_transcript_words: int = 150,
        include_technical_metadata: bool = True,
        include_audit_capabilities: bool = False,
    ) -> None:
        self.max_transcript_words = max_transcript_words
        self.include_technical_metadata = include_technical_metadata
        self.include_audit_capabilities = include_audit_capabilities

    def serialize(
        self,
        content: Optional[Content] = None,
        profile: Optional[ContentProfile] = None,
        platform_override: Optional[Platform] = None,
    ) -> str:
        """
        Produce a cohesive Markdown summary of the content and its extracted signals.
        """
        # Resolve profile from content if not explicitly passed
        if profile is None and content is not None:
            profile = getattr(content, "profile", None)

        sections = []

        # 1. Platform & Media Format
        platform_val = (
            platform_override.value
            if platform_override
            else (
                content.platform.value
                if content
                else (profile.media_info.platform.value if profile else "generic")
            )
        )
        media_type_val = (
            content.media_type.value
            if content
            else (profile.media_info.media_type.value if profile else "short_video")
        )

        format_lines = [
            f"- **Target Platform**: {platform_val.upper()}",
            f"- **Media Format**: {media_type_val}",
        ]

        if profile and profile.media_info.duration_sec is not None:
            dim_str = f" ({profile.media_info.width}x{profile.media_info.height})" if profile.media_info.width else ""
            format_lines.append(f"- **Duration**: {profile.media_info.duration_sec:.1f}s{dim_str}")
        elif content and content.metadata.get("duration_sec"):
            format_lines.append(f"- **Duration**: {float(content.metadata['duration_sec']):.1f}s")

        sections.append("### 1. PLATFORM & FORMAT\n" + "\n".join(format_lines))

        # 2. Text & Caption
        caption_text = (
            content.caption
            if content and content.caption
            else (profile.basic.caption if profile and profile.basic.caption else None)
        )
        text_p: Optional[TextAnalysis] = profile.text if profile else None

        text_lines = []
        if caption_text:
            text_lines.append(f'- **Caption**: "{caption_text}"')
        if text_p:
            stats = []
            if text_p.word_count > 0:
                stats.append(f"{text_p.word_count} words")
            if text_p.readability_score is not None:
                stats.append(f"Readability: {text_p.readability_score:.1f}/100")
            if stats:
                text_lines.append(f"- **Text Stats**: {', '.join(stats)}")
            if text_p.hashtags:
                text_lines.append(f"- **Hashtags**: {' '.join(text_p.hashtags)}")
            if text_p.cta_present:
                text_lines.append(f"- **Call to Action (CTA)**: Present (Type: '{text_p.cta_type or 'general'}')")

        if text_lines:
            sections.append("### 2. CAPTION & COPY\n" + "\n".join(text_lines))

        # 3. Opening Hook (First 0-3s)
        hook_p: Optional[HookAnalysis] = profile.hook if profile else None
        if hook_p and hook_p.hook_text:
            h_type = hook_p.hook_type.value if hasattr(hook_p.hook_type, "value") else str(hook_p.hook_type)
            hook_lines = [
                f'- **Hook Content (0-{hook_p.hook_duration_sec:.0f}s)**: "{hook_p.hook_text}"',
                f"- **Hook Mechanism**: {h_type.replace('_', ' ').title()}",
                f"- **Stopping Power (Strength)**: {hook_p.hook_strength:.2f} / 1.00",
                f"- **Curiosity Gap**: {hook_p.curiosity:.2f} | **Clarity**: {hook_p.clarity:.2f} | **Novelty**: {hook_p.novelty:.2f} | **Specificity**: {hook_p.specificity:.2f}",
            ]
            sections.append("### 3. OPENING HOOK (FIRST 0-3 SECONDS)\n" + "\n".join(hook_lines))

        # 4. Spoken Dialogue / Transcript
        transcript_text = (
            content.transcript
            if content and content.transcript
            else (profile.basic.transcript if profile and profile.basic.transcript else None)
        )
        trans_p: Optional[TranscriptAnalysis] = profile.transcript if profile else None

        if transcript_text or (trans_p and (trans_p.speaking_rate_wpm or trans_p.key_topics or trans_p.repeated_phrases)):
            trans_lines = []
            if transcript_text:
                truncated_transcript = self._truncate_text(transcript_text, self.max_transcript_words)
                trans_lines.append(f'- **Dialogue / Speech**: "{truncated_transcript}"')
            if trans_p and trans_p.speaking_rate_wpm:
                trans_lines.append(f"- **Speaking Rate**: {trans_p.speaking_rate_wpm:.0f} WPM")
            if trans_p and trans_p.key_topics:
                trans_lines.append(f"- **Key Topics**: {', '.join(trans_p.key_topics)}")
            if trans_p and trans_p.repeated_phrases:
                trans_lines.append(f"- **Repeated Phrases**: {', '.join(trans_p.repeated_phrases)}")
            if trans_lines:
                sections.append("### 4. SPOKEN DIALOGUE & AUDIO\n" + "\n".join(trans_lines))

        # 5. Visual Signals (if short video / image / thumbnail)
        vis_p: Optional[VisualAnalysis] = profile.visual if profile else None
        if vis_p and (vis_p.faces_present is not None or vis_p.detected_objects or vis_p.scene_changes is not None):
            vis_lines = []
            if vis_p.faces_present is not None:
                vis_lines.append(f"- **Faces Visible**: {vis_p.faces_present} (Count: {vis_p.face_count or 0})")
            if vis_p.text_present is not None:
                vis_lines.append(f"- **On-Screen Text Overlay**: {vis_p.text_present}")
            if vis_p.detected_objects:
                vis_lines.append(f"- **Detected Objects**: {', '.join(vis_p.detected_objects)}")
            if vis_p.scene_changes is not None:
                vis_lines.append(f"- **Scene Changes**: {vis_p.scene_changes} cuts")
            if vis_p.visual_hook and vis_p.visual_hook.first_frame_clarity is not None:
                vis_lines.append(f"- **First Frame Clarity**: {vis_p.visual_hook.first_frame_clarity:.2f} / 1.00")
            if vis_lines:
                sections.append("### 5. VISUAL & THUMBNAIL SIGNALS\n" + "\n".join(vis_lines))

        # 6. Narrative Structure
        struct_p: Optional[ContentStructure] = profile.structure if profile else None
        if struct_p and struct_p.hook.detected:
            struct_lines = []
            for seg_name in ["hook", "context", "development", "payoff", "cta"]:
                seg = getattr(struct_p, seg_name, None)
                if seg and seg.detected:
                    t_str = f"[{seg.start_sec:.1f}s - {seg.end_sec:.1f}s]" if seg.start_sec is not None else ""
                    summary_str = f": {seg.summary}" if seg.summary else ""
                    struct_lines.append(f"- **{seg_name.title()}** {t_str}{summary_str}")
            if struct_p.pacing_score is not None:
                struct_lines.append(f"- **Pacing Score**: {struct_p.pacing_score:.2f} / 1.00")
            if struct_lines:
                sections.append("### 6. NARRATIVE STRUCTURE\n" + "\n".join(struct_lines))

        # 7. Intrinsic Engagement Affordance Signals (Layer 2)
        eng_p: Optional[EngagementFeatures] = profile.engagement_signals if profile else None
        if eng_p:
            eng_lines = [
                f"- **Curiosity Signal**: {eng_p.curiosity_signal:.2f} [Content withholds info to provoke interest]",
                f"- **Novelty Signal**: {eng_p.novelty_signal:.2f} [Freshness/uniqueness vs feed clichés]",
                f"- **Usefulness Signal**: {eng_p.usefulness_signal:.2f} [Actionable educational value]",
                f"- **Relatability Signal**: {eng_p.relatability_signal:.2f} [Personal resonance with everyday student/creator life]",
                f"- **Shareability Signal**: {eng_p.shareability_signal:.2f} [Social currency & group-chat forwarding appeal]",
                f"- **Saveability Signal**: {eng_p.saveability_signal:.2f} [Reference utility for bookmarking]",
            ]
            sections.append("### 7. INTRINSIC CONTENT AFFORDANCE SIGNALS (Layer 2)\n" + "\n".join(eng_lines))

        # 8. Emotional Profile
        emo_p: Optional[EmotionalProfile] = profile.emotional if profile else None
        if emo_p:
            emo_lines = [
                f"- **Dominant Tone**: {emo_p.dominant_emotion.upper()} (Intensity: {emo_p.emotional_intensity:.2f})",
                f"- **Humor Signal**: {emo_p.humor:.2f} | **Surprise Signal**: {emo_p.surprise:.2f} | **Curiosity**: {emo_p.curiosity:.2f}",
            ]
            sections.append("### 8. EMOTIONAL PROFILE\n" + "\n".join(emo_lines))

        return "\n\n".join(sections)

    def _truncate_text(self, text: str, max_words: int) -> str:
        """Truncate text cleanly at word boundaries if exceeding max_words budget."""
        words = text.split()
        if len(words) <= max_words:
            return text
        return " ".join(words[:max_words]) + " [... truncated for length]"
