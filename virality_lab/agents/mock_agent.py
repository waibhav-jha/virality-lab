"""
Deterministic and heuristic Mock Audience Agent.
Enables offline testing, benchmarking, and development without any external LLM dependencies.
"""

from typing import Any, Callable, Dict, List, Optional
from virality_lab.agents.base_agent import AudienceAgent
from virality_lab.core.content import Content
from virality_lab.core.persona import AttentionSpan, Persona
from virality_lab.core.reaction import EmotionalResponse, Reaction


class MockAudienceAgent(AudienceAgent):
    """
    Mock audience agent that produces deterministic or trait-calibrated reactions.
    """

    def __init__(
        self,
        persona: Persona,
        static_reaction: Optional[Reaction] = None,
        custom_evaluator: Optional[Callable[[Persona, Content], Reaction]] = None,
    ) -> None:
        super().__init__(persona=persona)
        self.static_reaction = static_reaction
        self.custom_evaluator = custom_evaluator

    def evaluate(self, content: Content) -> Reaction:
        """Evaluate content using static response, custom evaluator, or persona trait heuristic."""
        if not isinstance(content, Content):
            raise TypeError(f"Expected Content instance, got {type(content).__name__}")

        if self.static_reaction is not None:
            return self.static_reaction.model_copy(update={"persona_name": self.persona.name})

        if self.custom_evaluator is not None:
            return self.custom_evaluator(self.persona, content)

        return self._evaluate_from_traits(content)

    def _evaluate_from_traits(self, content: Content) -> Reaction:
        """Derive calibrated reaction probabilities deterministically from persona traits."""
        # Baseline attention modifier
        span_mod = {
            AttentionSpan.EXTREMELY_LOW: -0.25,
            AttentionSpan.LOW: -0.10,
            AttentionSpan.MEDIUM: 0.05,
            AttentionSpan.HIGH: 0.15,
        }.get(self.persona.attention_span, 0.0)

        # Content feature awareness for realistic variant testing
        text_lower = ((content.caption or "") + " " + (content.transcript or "")).lower()
        words = text_lower.split()
        is_deficient = len(words) <= 2
        is_minimal = 3 <= len(words) <= 6
        length_penalty = -0.48 if is_deficient else (-0.20 if is_minimal else 0.0)

        hook_boost = 0.12 if any(k in text_lower for k in ["still doing", "wait until", "i replaced", "?", "secret", "hack", "changed my", "warning", "save this", "step-by-step", "framework"]) else 0.0
        share_boost = 0.12 if any(k in text_lower for k in ["send this", "share this", "study group", "friends", "finals", "went up", "shocking"]) else 0.0
        save_boost = 0.15 if any(k in text_lower for k in ["save this", "checklist", "guide", "step 1", "save for later", "save for reference", "tools", "framework"]) else 0.0
        comp_boost = 0.08 if any(k in text_lower for k in ["here is the exact", "3-step", "cut 4 hours", "immediate", "in 60 seconds"]) else 0.0

        # Baseline probabilities computed from traits, length, and content signals
        stop_scroll = max(0.05, min(0.98, 0.65 + (self.persona.novelty_preference * 0.20) + span_mod + hook_boost + length_penalty))
        watch = max(0.05, min(0.95, 0.60 + span_mod + (self.persona.trend_sensitivity * 0.15) + (hook_boost * 0.5) + length_penalty))
        completion = max(0.05, min(0.95, watch * 0.85 + (span_mod * 0.5) + comp_boost + (length_penalty * 0.5)))

        like = max(0.05, min(0.95, (self.persona.humor_preference * 0.4) + (self.persona.novelty_preference * 0.3) + 0.1 + length_penalty))
        share = max(0.05, min(0.98, self.persona.share_tendency * 0.90 + (0.05 if self.persona.trend_sensitivity > 0.7 else -0.05) + share_boost + length_penalty))
        comment = max(0.05, min(0.95, self.persona.comment_tendency * 0.85 + (0.10 if self.persona.clickbait_tolerance < 0.3 else 0.0) + (length_penalty * 0.5)))
        save = max(0.05, min(0.95, 0.30 + (0.35 if self.persona.attention_span in [AttentionSpan.MEDIUM, AttentionSpan.HIGH] else 0.0) + save_boost + length_penalty))
        follow = max(0.05, min(0.90, (like * 0.4) + (save * 0.3)))


        # Qualitative synthesis
        strengths: List[str] = []
        weaknesses: List[str] = []

        if self.persona.trend_sensitivity >= 0.7:
            strengths.append("High trend relevance and modern framing")
        if self.persona.humor_preference >= 0.7:
            strengths.append("Engaging, punchy delivery format")
        if not strengths:
            strengths.append("Clear topic presentation")

        if self.persona.attention_span in [AttentionSpan.EXTREMELY_LOW, AttentionSpan.LOW]:
            weaknesses.append("First 2-3 seconds need a faster visual or auditory payoff")
        if self.persona.clickbait_tolerance <= 0.3:
            weaknesses.append("Claims require earlier verification to avoid triggering skepticism")
        if not weaknesses:
            weaknesses.append("Pacing in the middle section could be slightly tightened")

        # Emotional reaction
        emotion = EmotionalResponse.CURIOUS.value
        if self.persona.clickbait_tolerance <= 0.3:
            emotion = EmotionalResponse.SKEPTICAL.value
        elif self.persona.humor_preference >= 0.8:
            emotion = EmotionalResponse.ENTERTAINED.value
        elif self.persona.attention_span == AttentionSpan.EXTREMELY_LOW and stop_scroll < 0.6:
            emotion = EmotionalResponse.INDIFFERENT.value

        reasoning = (
            f"Simulated behavior for {self.persona.name}: "
            f"With attention span '{self.persona.attention_span.value}' and trend sensitivity {self.persona.trend_sensitivity:.2f}, "
            f"the initial hook yielded a {stop_scroll:.0%} stop-scroll probability. "
            f"{'Likely to share with friends.' if share > 0.6 else 'Less likely to share without a stronger personal connection.'}"
        )

        # In-character simulated social media comment
        p_name = self.persona.name.lower()
        snippet = (content.caption or "")[:40].strip()
        simulated_comment = ""
        if is_deficient:
            if "gen-z" in p_name or "student" in p_name:
                simulated_comment = f"bro literally just typed '{snippet}' and hit publish 💀😭"
            elif "skeptic" in p_name:
                simulated_comment = "Zero context or substance. Instant skip."
            elif "creator" in p_name:
                simulated_comment = "Where is the hook, visual cue, or call to action? Algorithm won't push this."
            elif "casual" in p_name:
                simulated_comment = "Did my feed lag or is this just one word?"
            else:
                simulated_comment = "Missing educational or domain subject matter."
        else:
            if "gen-z" in p_name or "student" in p_name:
                simulated_comment = (
                    f"bro cooked with this one ngl 🔥 {('saved for finals week' if 'study' in text_lower or 'tool' in text_lower else 'immediate save')}"
                    if stop_scroll > 0.65
                    else "lost me in the first 2 seconds ngl... need a faster punchline"
                )
            elif "skeptic" in p_name:
                simulated_comment = (
                    "Wait, does this actually work or is it another freemium tool paywall?"
                    if ("ai" in text_lower or "tool" in text_lower)
                    else f"Where is the empirical data to support this? Need to see tangible proof."
                )
            elif "creator" in p_name:
                simulated_comment = (
                    "Clean opening retention hook. The 3-second pacing + save anchor is going to perform very well."
                    if stop_scroll > 0.70
                    else "Good premise, but tighten the opening frame — drop the fluff and start right on the value reveal."
                )
            elif "casual" in p_name:
                simulated_comment = (
                    "Adding this to my saved bookmarks that I tell myself I'll check this weekend 😂"
                    if stop_scroll > 0.60
                    else "Scrolled past after 2 seconds. Too much text to read on mobile."
                )
            else:
                simulated_comment = (
                    f"Practical and actionable framework. The breakdown is high reference utility."
                    if stop_scroll > 0.60
                    else "Needs to go deeper into technical implementation details rather than general surface advice."
                )

        return Reaction(
            persona_name=self.persona.name,
            stop_scroll=round(stop_scroll, 2),
            watch_probability=round(watch, 2),
            completion_probability=round(completion, 2),
            like_probability=round(like, 2),
            comment_probability=round(comment, 2),
            share_probability=round(share, 2),
            save_probability=round(save, 2),
            follow_probability=round(follow, 2),
            emotional_response=emotion,
            strengths=strengths,
            weaknesses=weaknesses,
            reasoning=reasoning,
            simulated_comment=simulated_comment,
            metadata={"agent_type": "MockAudienceAgent", "calibrated": True},
        )

