import re
from typing import Any, Dict, List, Optional, Tuple

from virality_lab.scoring.schemas import (
    ABTestExplanation,
    ComponentScores,
    FormulaBreakdown,
    MetricDistribution,
    PersonaScore,
    RetentionFunnelStep,
    ScoreDiagnostics,
    ScoreExplanation,
    SignalAttribution,
    VariantDifferential,
)


class ExplanationEngine:
    """
    Generates deterministic, rule-based explanations and diagnostic audits from scoring data.
    """

    def extract_signal_attributions(
        self,
        caption: Any = "",
        transcript: Any = "",
        platform: Optional[str] = None,
        content_profile: Optional[Any] = None,
    ) -> List[SignalAttribution]:
        """
        Extract itemized positive boosts and negative friction signals detected in content.
        """
        if not isinstance(caption, str):
            caption = str(caption) if caption is not None else ""
        if not isinstance(transcript, str):
            transcript = str(transcript) if transcript is not None else ""

        text = caption.strip()
        lower = text.lower()
        word_count = len(text.split())
        signals: List[SignalAttribution] = []

        # 1. Deficient length signal
        if word_count <= 2:
            signals.append(
                SignalAttribution(
                    signal_id="sig_deficient_length",
                    signal_name="Under-Structured / Minimal Payload",
                    category="retention",
                    impact_points=-35.0,
                    matched_text=text[:30],
                    rationale="Single-word or ultra-short input lacks narrative substance or hook frame, triggering instant scroll-past.",
                    confidence=0.98,
                )
            )
            return signals

        # 2. Pattern Interrupt
        pattern_interrupt_match = re.search(
            r"\b(stop (scrolling|doing|making)|never (do|use)|biggest mistake|nobody (talks|tells)|secret|banned|illegal|hidden)\b",
            lower,
        )
        if pattern_interrupt_match:
            signals.append(
                SignalAttribution(
                    signal_id="sig_pattern_interrupt",
                    signal_name="Cognitive Pattern Interrupt Hook",
                    category="hook",
                    impact_points=+9.0,
                    matched_text=pattern_interrupt_match.group(0),
                    rationale="High-arousal pattern interrupt creates cognitive dissonance, suppressing automated finger muscle scroll reflex.",
                    confidence=0.92,
                )
            )

        # 3. Frontloaded Payoff
        payoff_match = re.search(
            r"\b(went up|exploded|changed everything|in \d+ (seconds|minutes|hours|days)|for free|0 cost|works every time|my grades)\b",
            lower,
        )
        if payoff_match:
            signals.append(
                SignalAttribution(
                    signal_id="sig_frontloaded_payoff",
                    signal_name="Frontloaded Concrete Payoff",
                    category="retention",
                    impact_points=+9.0,
                    matched_text=payoff_match.group(0),
                    rationale="Promise of immediate utility frontloaded in the first 3 seconds reduces cognitive friction and abandonment.",
                    confidence=0.90,
                )
            )

        # 4. Numerical Specificity & Proof
        num_match = re.search(
            r"\b\d+(\.\d+)?(%|x|k|hrs?|hours?|mins?|minutes?|days?|tools?|steps?|ways?|reasons?|\$)?\b",
            text,
        )
        if num_match:
            signals.append(
                SignalAttribution(
                    signal_id="sig_numerical_specificity",
                    signal_name="Quantified Specificity Anchor",
                    category="cognitive",
                    impact_points=+8.0,
                    matched_text=num_match.group(0),
                    rationale="Exact figures and numbers disarm viewer skepticism by establishing concrete, tangible stakes.",
                    confidence=0.88,
                )
            )

        # 5. Save/Bookmark CTA
        save_match = re.search(r"\b(save (this|for later)|bookmark|keep this)\b", lower)
        if save_match:
            signals.append(
                SignalAttribution(
                    signal_id="sig_save_cta",
                    signal_name="High-Conversion Bookmark Anchor",
                    category="utility",
                    impact_points=+8.0,
                    matched_text=save_match.group(0),
                    rationale="Explicit bookmark instruction heavily amplifies algorithm distribution via platform save weighting.",
                    confidence=0.94,
                )
            )

        # 6. Curiosity Gap / Question
        q_match = re.search(r"(\?|^(why|how|what|did you know|have you ever))", lower)
        if q_match:
            signals.append(
                SignalAttribution(
                    signal_id="sig_curiosity_trigger",
                    signal_name="Open-Loop Curiosity Stimulator",
                    category="hook",
                    impact_points=+7.0,
                    matched_text="?" if "?" in text else (q_match.group(0) if q_match else None),
                    rationale="Unresolved open curiosity loops stimulate comment responses and retention through resolution seeking.",
                    confidence=0.85,
                )
            )

        # 7. Social Proof Framing
        proof_match = re.search(r"\b(my (professor|boss|client|team|friend)|after \d+ (years|months)|case study|results)\b", lower)
        if proof_match:
            signals.append(
                SignalAttribution(
                    signal_id="sig_social_proof",
                    signal_name="First-Person Authority Anchor",
                    category="cognitive",
                    impact_points=+6.0,
                    matched_text=proof_match.group(0),
                    rationale="First-person narrative grounded in authority increases perceived credibility across skeptical personas.",
                    confidence=0.86,
                )
            )

        # 8. Platform Alignment / Mismatch
        p_str = str(platform).lower() if platform else ""
        if "linkedin" in p_str and any(s in lower for s in ["bro", "ngl", "💀", "fr", "cooked"]):
            signals.append(
                SignalAttribution(
                    signal_id="sig_platform_slang_penalty",
                    signal_name="Platform Vernacular Mismatch",
                    category="platform_fit",
                    impact_points=-15.0,
                    matched_text="casual feed slang on LinkedIn",
                    rationale="LinkedIn professional algorithm penalizes informal slang in favor of structured executive takeaways.",
                    confidence=0.91,
                )
            )
        elif "tiktok" in p_str and word_count > 35:
            signals.append(
                SignalAttribution(
                    signal_id="sig_tiktok_text_density_friction",
                    signal_name="High Text Cognitive Density",
                    category="platform_fit",
                    impact_points=-10.0,
                    matched_text=f"{word_count} words",
                    rationale="Excessive caption length on TikTok creates visual clutter over fast-moving vertical video feeds.",
                    confidence=0.87,
                )
            )

        return signals

    def generate_formula_breakdown(
        self,
        components: ComponentScores,
        platform_weights: Dict[str, float],
        overall_score: float,
        platform: Optional[str] = None,
    ) -> FormulaBreakdown:
        """
        Produce a step-by-step transparent mathematical equation of the virality score.
        """
        w_ret = platform_weights.get("retention", 0.35)
        w_sh = platform_weights.get("sharing", 0.25)
        w_eng = platform_weights.get("engagement", 0.25)
        w_conv = platform_weights.get("conversion", 0.15)

        raw_sum = (
            components.retention * w_ret
            + components.sharing * w_sh
            + components.engagement * w_eng
            + components.conversion * w_conv
        )
        raw_sum = round(raw_sum, 2)

        equation = (
            f"Score = ({w_ret:.2f} × {components.retention:.1f}) + "
            f"({w_sh:.2f} × {components.sharing:.1f}) + "
            f"({w_eng:.2f} × {components.engagement:.1f}) + "
            f"({w_conv:.2f} × {components.conversion:.1f})"
        )

        return FormulaBreakdown(
            formula_equation=equation,
            raw_weighted_sum=raw_sum,
            platform_weights=platform_weights,
            platform_multiplier=1.0,
            platform_bonus_points=round(overall_score - raw_sum, 2),
            calibrated_final_score=overall_score,
        )

    def generate_retention_funnel(
        self,
        raw_metrics: Dict[str, MetricDistribution],
        components: ComponentScores,
    ) -> List[RetentionFunnelStep]:
        """
        Generate 5-stage behavioral drop-off funnel telemetry.
        """
        ss_mean = raw_metrics.get("stop_scroll", MetricDistribution(mean=0.5, median=0.5, std_dev=0.1, min_val=0.4, max_val=0.6)).mean
        watch_mean = raw_metrics.get("watch_probability", MetricDistribution(mean=0.45, median=0.45, std_dev=0.1, min_val=0.3, max_val=0.5)).mean
        comp_mean = raw_metrics.get("completion_probability", MetricDistribution(mean=0.35, median=0.35, std_dev=0.1, min_val=0.2, max_val=0.4)).mean
        share_mean = raw_metrics.get("share_probability", MetricDistribution(mean=0.25, median=0.25, std_dev=0.1, min_val=0.1, max_val=0.3)).mean

        p0 = 100.0
        p1 = max(0.0, min(100.0, round(ss_mean * 100.0, 1)))
        p2 = max(0.0, min(p1, round((ss_mean * 0.80 + watch_mean * 0.20) * 100.0, 1)))
        p3 = max(0.0, min(p2, round(watch_mean * 100.0, 1)))
        p4 = max(0.0, min(p3, round(comp_mean * 100.0, 1)))
        p5 = max(0.0, min(p4, round(min(comp_mean, share_mean) * 100.0, 1)))

        return [
            RetentionFunnelStep(
                step_name="0.0s Feed Impression",
                time_seconds=0.0,
                retention_percentage=p0,
                dropoff_percentage=0.0,
                friction_note="Baseline initial viewer reach in algorithmic feed.",
            ),
            RetentionFunnelStep(
                step_name="1.5s Hook Window",
                time_seconds=1.5,
                retention_percentage=p1,
                dropoff_percentage=max(0.0, round(p0 - p1, 1)),
                friction_note="Instant stop-scroll decision window governed by opening visual & hook copy.",
            ),
            RetentionFunnelStep(
                step_name="5.0s Cognitive Engagement",
                time_seconds=5.0,
                retention_percentage=p2,
                dropoff_percentage=max(0.0, round(p1 - p2, 1)),
                friction_note="Initial comprehension threshold where audience evaluates value proposition.",
            ),
            RetentionFunnelStep(
                step_name="15.0s Mid-Sequence Pacing",
                time_seconds=15.0,
                retention_percentage=p3,
                dropoff_percentage=max(0.0, round(p2 - p3, 1)),
                friction_note="Mid-point retention curve sustaining attention before payoff delivery.",
            ),
            RetentionFunnelStep(
                step_name="100% Full Watch Completion",
                time_seconds=30.0,
                retention_percentage=p4,
                dropoff_percentage=max(0.0, round(p3 - p4, 1)),
                friction_note="Complete consumption indicating high narrative satisfaction.",
            ),
            RetentionFunnelStep(
                step_name="Amplification & Bookmark Action",
                time_seconds=32.0,
                retention_percentage=p5,
                dropoff_percentage=max(0.0, round(p4 - p5, 1)),
                friction_note="High-intent downstream virality trigger (Share DM / Save Bookmark).",
            ),
        ]

    def generate_diagnostics(
        self,
        components: ComponentScores,
        persona_scores: Dict[str, PersonaScore],
        strengths: List[str],
        weaknesses: List[str],
    ) -> ScoreDiagnostics:
        """
        Identify strongest and weakest dimensions and audience segments.
        """
        comp_dict = {
            "retention": components.retention,
            "sharing": components.sharing,
            "engagement": components.engagement,
            "conversion": components.conversion,
        }
        strongest_dim = max(comp_dict.items(), key=lambda x: x[1])[0]
        weakest_dim = min(comp_dict.items(), key=lambda x: x[1])[0]

        if persona_scores:
            strongest_persona = max(persona_scores.items(), key=lambda x: x[1].overall_score)[0]
            weakest_persona = min(persona_scores.items(), key=lambda x: x[1].overall_score)[0]
        else:
            strongest_persona = "N/A"
            weakest_persona = "N/A"

        return ScoreDiagnostics(
            strongest_dimension=strongest_dim,
            weakest_dimension=weakest_dim,
            strongest_persona=strongest_persona,
            weakest_persona=weakest_persona,
            consensus_strengths=strengths[:5],
            consensus_weaknesses=weaknesses[:5],
        )

    def generate_explanation(
        self,
        overall_score: float,
        components: ComponentScores,
        raw_metrics: Dict[str, MetricDistribution],
        persona_scores: Dict[str, PersonaScore],
        caption: str = "",
        transcript: str = "",
        platform: Optional[str] = None,
        platform_weights: Optional[Dict[str, float]] = None,
    ) -> ScoreExplanation:
        """
        Generate positive and negative drivers, signal attributions, formula breakdown, and retention funnel.
        """
        positive_drivers: List[str] = []
        negative_drivers: List[str] = []

        # Hook / Stop-scroll evaluation
        if "stop_scroll" in raw_metrics:
            ss_mean = raw_metrics["stop_scroll"].mean
            if ss_mean >= 0.75:
                positive_drivers.append(f"Strong opening hook stopping power ({ss_mean * 100:.0f}% stop-scroll rate) captures immediate attention.")
            elif ss_mean < 0.50:
                negative_drivers.append(f"Weak initial hook ({ss_mean * 100:.0f}% stop-scroll rate) leads to high immediate feed drop-off.")

        # Watch / Completion evaluation
        if "completion_probability" in raw_metrics:
            comp_mean = raw_metrics["completion_probability"].mean
            if comp_mean >= 0.70:
                positive_drivers.append(f"High watch-through completion ({comp_mean * 100:.0f}%) indicates strong narrative pacing and payoff.")
            elif comp_mean < 0.45:
                negative_drivers.append(f"Significant mid-video drop-off ({comp_mean * 100:.0f}% completion rate) suggests delayed or weak payoff.")

        # Shareability evaluation
        if "share_probability" in raw_metrics:
            sh_mean = raw_metrics["share_probability"].mean
            if sh_mean >= 0.60:
                positive_drivers.append(f"High organic shareability ({sh_mean * 100:.0f}%) drives direct peer-to-peer amplification.")
            elif sh_mean < 0.35:
                negative_drivers.append(f"Low forwarding probability ({sh_mean * 100:.0f}%) limits organic viral distribution.")

        # Save / Utility evaluation
        if "save_probability" in raw_metrics:
            sv_mean = raw_metrics["save_probability"].mean
            if sv_mean >= 0.65:
                positive_drivers.append(f"Strong reference utility ({sv_mean * 100:.0f}% bookmark rate) provides algorithmic boost via saves.")

        # Follow / Conversion evaluation
        if "follow_probability" in raw_metrics:
            fl_mean = raw_metrics["follow_probability"].mean
            if fl_mean < 0.30:
                negative_drivers.append(f"Low creator follow intent ({fl_mean * 100:.0f}%) limits permanent audience growth.")

        # Persona-specific insights
        if persona_scores:
            best_name, best_p = max(persona_scores.items(), key=lambda x: x[1].overall_score)
            worst_name, worst_p = min(persona_scores.items(), key=lambda x: x[1].overall_score)

            if best_p.overall_score >= 80.0:
                positive_drivers.append(f"Resonates exceptionally well with '{best_name}' segment ({best_p.overall_score:.0f}/100).")
            if worst_p.overall_score <= 50.0:
                friction_snippet = f": {worst_p.weaknesses[0]}" if worst_p.weaknesses else ""
                negative_drivers.append(f"High resistance from '{worst_name}' segment ({worst_p.overall_score:.0f}/100){friction_snippet}.")

        # Audience verdict synthesis
        if overall_score >= 80.0:
            verdict = "High virality potential driven by strong initial retention and broad audience resonance."
        elif overall_score >= 65.0:
            verdict = "Solid virality potential with clear strengths in specific audience segments, but targeted optimization needed on friction points."
        elif overall_score >= 50.0:
            verdict = "Moderate performance with audience division; requires hook strengthening and clearer value proposition."
        else:
            verdict = "Low virality potential due to widespread audience friction and rapid drop-off."

        # Generate new explainable structures
        signal_attributions = self.extract_signal_attributions(
            caption=caption,
            transcript=transcript,
            platform=platform,
        )

        weights = platform_weights or {"retention": 0.35, "sharing": 0.25, "engagement": 0.25, "conversion": 0.15}
        formula_breakdown = self.generate_formula_breakdown(
            components=components,
            platform_weights=weights,
            overall_score=overall_score,
            platform=platform,
        )

        retention_funnel = self.generate_retention_funnel(
            raw_metrics=raw_metrics,
            components=components,
        )

        return ScoreExplanation(
            positive_drivers=positive_drivers,
            negative_drivers=negative_drivers,
            audience_verdict=verdict,
            signal_attributions=signal_attributions,
            formula_breakdown=formula_breakdown,
            retention_funnel=retention_funnel,
        )

