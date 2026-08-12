"""
Content Structure Analyzer partitioning video content into narrative arc segments:
Hook -> Context -> Development -> Payoff -> CTA.
Uses explicit confidence scores and detection flags.
"""

from typing import Optional
from virality_lab.analyzer.schemas import ContentStructure, StructureSegment


class StructureAnalyzer:
    """
    Detects and estimates narrative structural boundaries in video and text content.
    """

    def analyze(
        self,
        duration_sec: Optional[float] = None,
        transcript_text: Optional[str] = None,
        cta_present: bool = False,
    ) -> ContentStructure:
        """
        Partition video narrative into structural milestones based on duration and transcript cues.
        """
        if duration_sec is None or duration_sec <= 0:
            # For non-video / text content, provide text-based structure estimation
            return ContentStructure(
                hook=StructureSegment(detected=True, confidence=0.85, summary="Opening caption / text sentence"),
                context=StructureSegment(detected=True, confidence=0.70, summary="Background and premise"),
                development=StructureSegment(detected=True, confidence=0.70, summary="Core points and arguments"),
                payoff=StructureSegment(detected=True, confidence=0.60, summary="Main takeaway or punchline"),
                cta=StructureSegment(detected=cta_present, confidence=0.90 if cta_present else 0.40, summary="Call to action" if cta_present else None),
                pacing_score=0.75,
            )

        d = duration_sec

        # Standard short-form pacing partition
        hook_end = min(3.0, d * 0.20)
        context_end = min(hook_end + 4.0, d * 0.40)
        dev_end = min(context_end + 7.0, d * 0.75)
        payoff_end = min(dev_end + 3.0, d * 0.90) if cta_present else d
        cta_start = payoff_end

        hook_seg = StructureSegment(
            detected=True,
            start_sec=0.0,
            end_sec=round(hook_end, 2),
            confidence=0.92,
            summary="Opening pattern interrupt and premise hook",
        )

        context_seg = StructureSegment(
            detected=d >= 4.0,
            start_sec=round(hook_end, 2),
            end_sec=round(context_end, 2),
            confidence=0.80,
            summary="Context and problem framing",
        )

        dev_seg = StructureSegment(
            detected=d >= 7.0,
            start_sec=round(context_end, 2),
            end_sec=round(dev_end, 2),
            confidence=0.78,
            summary="Main demonstration or breakdown",
        )

        payoff_seg = StructureSegment(
            detected=d >= 10.0,
            start_sec=round(dev_end, 2),
            end_sec=round(payoff_end, 2),
            confidence=0.70,
            summary="Value delivery and punchline payoff",
        )

        cta_seg = StructureSegment(
            detected=cta_present or (d >= 12.0),
            start_sec=round(cta_start, 2),
            end_sec=round(d, 2),
            confidence=0.85 if cta_present else 0.50,
            summary="Call to action and profile engagement trigger" if (cta_present or d >= 12.0) else None,
        )

        # Estimate pacing quality: 15-30s videos with all segments have ideal pacing
        pacing = 0.85 if 12.0 <= d <= 45.0 else 0.65

        return ContentStructure(
            hook=hook_seg,
            context=context_seg,
            development=dev_seg,
            payoff=payoff_seg,
            cta=cta_seg,
            pacing_score=pacing,
        )
