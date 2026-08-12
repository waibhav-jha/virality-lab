"""
Hook Analyzer evaluating the opening 0-3s (or opening sentence) of content.
Quantifies hook type, stopping power, curiosity, clarity, specificity, and novelty.
"""

import re
from typing import Optional
from virality_lab.analyzer.schemas import HookAnalysis, HookType


class HookAnalyzer:
    """
    Analyzes the initial hook segment of social media content.
    Configurable hook duration per platform.
    """

    PATTERN_HOOKS = [
        (HookType.PATTERN_INTERRUPT, [r"\bstop scrolling\b", r"\bwait\b", r"\bhold on\b", r"\blook at this\b", r"\bdon't scroll\b"]),
        (HookType.CONTRARIAN_STATEMENT, [r"\bstop doing\b", r"\bis dead\b", r"\bis a lie\b", r"\bunpopular opinion\b", r"\byou're doing it wrong\b", r"\bnever do\b"]),
        (HookType.CURIOSITY_GAP, [r"\bsecret\b", r"\bnobody talks about\b", r"\bwhat happens when\b", r"\bthe reason why\b", r"\bi replaced\b", r"\bhow i\b"]),
        (HookType.VALUE_PROMISE, [r"\bhow to\b", r"\b\d+ (tools|ways|tips|hacks|steps|rules)\b", r"\bsave \d+\b", r"\bhere is how\b", r"\bwill save you\b"]),
        (HookType.PROBLEM_AGITATION, [r"\btired of\b", r"\bstruggling with\b", r"\bwasting time\b", r"\bworst mistake\b", r"\bfrustrated\b"]),
        (HookType.STORY_IN_MEDIAS_RES, [r"\bso yesterday\b", r"\bit was \d+ (am|pm)\b", r"\bi was standing\b", r"\bi never expected\b"]),
    ]

    def __init__(self, default_hook_duration_sec: float = 3.0) -> None:
        self.default_hook_duration_sec = default_hook_duration_sec

    def analyze(
        self,
        transcript: Optional[str] = None,
        caption: Optional[str] = None,
        hook_duration_sec: Optional[float] = None,
    ) -> HookAnalysis:
        """
        Analyze the opening hook from transcript or caption.
        """
        duration = hook_duration_sec or self.default_hook_duration_sec

        # Extract opening text
        hook_text = self._extract_opening_text(transcript, caption)
        if not hook_text:
            return HookAnalysis(
                hook_text="",
                hook_type=HookType.GENERIC,
                hook_duration_sec=duration,
                hook_strength=0.2,
                curiosity=0.2,
                clarity=0.2,
                novelty=0.2,
                emotional_intensity=0.2,
                specificity=0.1,
            )

        low_hook = hook_text.lower()

        # Classify Hook Type
        hook_type = self._classify_hook_type(low_hook)

        # Specificity: check for numbers, exact timeframes, percentages, dollars
        has_numbers = bool(re.search(r"\b\d+(\.\d+)?(k|m|%| hours| mins| tools| ways| steps|\$)?\b", low_hook))
        specificity = 0.85 if has_numbers else 0.40

        # Curiosity: curiosity words, open loops, or questions
        curiosity_boost = 0.35 if hook_type in [HookType.CURIOSITY_GAP, HookType.CONTRARIAN_STATEMENT] else 0.15
        if "?" in hook_text:
            curiosity_boost += 0.20
        curiosity = min(0.98, 0.45 + curiosity_boost)

        # Clarity: concise length (10 - 25 words is ideal for opening 3s)
        word_count = len(re.findall(r"\b\w+\b", hook_text))
        if 5 <= word_count <= 25:
            clarity = 0.85
        elif word_count < 5:
            clarity = 0.60
        else:
            clarity = 0.50

        # Novelty signal
        novelty = 0.80 if hook_type in [HookType.PATTERN_INTERRUPT, HookType.CONTRARIAN_STATEMENT] else 0.65

        # Emotional Intensity
        has_urgency = bool(re.search(r"\b(urgent|now|instantly|crazy|insane|never|always|warning)\b", low_hook))
        emotional_intensity = 0.85 if has_urgency or "!" in hook_text else 0.55

        # Overall Hook Strength composite
        hook_strength = (
            (curiosity * 0.35)
            + (clarity * 0.25)
            + (specificity * 0.20)
            + (novelty * 0.10)
            + (emotional_intensity * 0.10)
        )

        return HookAnalysis(
            hook_text=hook_text,
            hook_type=hook_type,
            hook_duration_sec=duration,
            hook_strength=round(min(1.0, max(0.05, hook_strength)), 2),
            curiosity=round(curiosity, 2),
            clarity=round(clarity, 2),
            novelty=round(novelty, 2),
            emotional_intensity=round(emotional_intensity, 2),
            specificity=round(specificity, 2),
        )

    def _extract_opening_text(self, transcript: Optional[str], caption: Optional[str]) -> str:
        """Extract the first sentence or first 20 words from transcript or caption."""
        source = transcript if (transcript and transcript.strip()) else caption
        if not source or not source.strip():
            return ""

        # Take first sentence or first 25 words
        sentences = [s.strip() for s in re.split(r"[.!?\n]+", source.strip()) if s.strip()]
        if sentences:
            first_sent = sentences[0]
            words = first_sent.split()
            if len(words) > 25:
                return " ".join(words[:25]) + "..."
            return first_sent
        return ""

    def _classify_hook_type(self, text: str) -> HookType:
        """Match text against known hook patterns."""
        if text.endswith("?") or text.startswith(("did you know", "why do", "what if", "have you ever", "is it true")):
            return HookType.QUESTION

        for hook_type, patterns in self.PATTERN_HOOKS:
            for p in patterns:
                if re.search(p, text):
                    return hook_type

        return HookType.GENERIC
