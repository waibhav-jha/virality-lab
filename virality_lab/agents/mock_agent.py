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
        hook_boost = 0.10 if any(k in text_lower for k in ["still doing", "wait until", "i replaced", "?", "secret", "hack", "changed my", "warning"]) else 0.0
        share_boost = 0.12 if any(k in text_lower for k in ["send this", "share this", "study group", "friends", "finals"]) else 0.0
        save_boost = 0.12 if any(k in text_lower for k in ["save this", "checklist", "guide", "step 1", "save for later", "save for reference"]) else 0.0
        comp_boost = 0.08 if any(k in text_lower for k in ["here is the exact", "3-step", "cut 4 hours", "immediate"]) else 0.0

        # Baseline probabilities computed from traits and content signals
        stop_scroll = max(0.05, min(0.98, 0.65 + (self.persona.novelty_preference * 0.20) + span_mod + hook_boost))
        watch = max(0.05, min(0.95, 0.60 + span_mod + (self.persona.trend_sensitivity * 0.15) + (hook_boost * 0.5)))
        completion = max(0.05, min(0.95, watch * 0.85 + (span_mod * 0.5) + comp_boost))

        like = max(0.05, min(0.95, (self.persona.humor_preference * 0.4) + (self.persona.novelty_preference * 0.3) + 0.1))
        share = max(0.05, min(0.98, self.persona.share_tendency * 0.90 + (0.05 if self.persona.trend_sensitivity > 0.7 else -0.05) + share_boost))
        comment = max(0.05, min(0.95, self.persona.comment_tendency * 0.85 + (0.10 if self.persona.clickbait_tolerance < 0.3 else 0.0)))
        save = max(0.05, min(0.95, 0.30 + (0.35 if self.persona.attention_span in [AttentionSpan.MEDIUM, AttentionSpan.HIGH] else 0.0) + save_boost))
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
            metadata={"agent_type": "MockAudienceAgent", "calibrated": True},
        )
