"""
Deterministic Mock LLM Provider for offline testing, local demonstrations, and CI/CD pipelines.
Requires zero API keys and produces persona-calibrated structured reactions.
"""

from typing import Any, Callable, Dict, List, Optional, Type, TypeVar
import json
from pydantic import BaseModel

from virality_lab.llm.base import LLMProvider, LLMResponse

T = TypeVar("T", bound=BaseModel)


class MockLLMProvider(LLMProvider):
    """
    Mock LLM Provider that simulates model responses deterministically.
    Supports queued responses, fallback generation functions, or default synthetic reactions.
    """

    def __init__(
        self,
        model_name: str = "mock-model-v1",
        predefined_responses: Optional[List[str]] = None,
        custom_generator: Optional[Callable[[str, str], str]] = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(model_name=model_name, **kwargs)
        self.predefined_responses: List[str] = predefined_responses or []
        self.call_history: List[Dict[str, str]] = []
        self.custom_generator = custom_generator

    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> LLMResponse:
        """Record the call and return next mock response or generate synthetic output."""
        self.call_history.append({"system_prompt": system_prompt, "user_prompt": user_prompt})

        if self.predefined_responses:
            output = self.predefined_responses.pop(0)
        elif self.custom_generator:
            output = self.custom_generator(system_prompt, user_prompt)
        else:
            output = self._generate_default_synthetic_response(system_prompt, user_prompt)

        return LLMResponse(
            content=output,
            model_name=self.model_name,
            usage={"prompt_tokens": 120, "completion_tokens": 80, "total_tokens": 200},
            finish_reason="stop",
        )

    def _generate_default_synthetic_response(self, system_prompt: str, user_prompt: str) -> str:
        """Synthesize a structured reaction payload based on keywords in the prompts."""
        persona_name = "Audience Persona"
        for line in system_prompt.split("\n"):
            if "### PERSONA:" in line:
                persona_name = line.replace("### PERSONA:", "").strip()
                break

        # Generate realistic calibrated values
        low_name = persona_name.lower()
        if "gen-z" in low_name:
            data = {
                "persona_name": persona_name,
                "stop_scroll": 0.86,
                "watch_probability": 0.78,
                "completion_probability": 0.65,
                "like_probability": 0.74,
                "comment_probability": 0.62,
                "share_probability": 0.84,
                "save_probability": 0.45,
                "follow_probability": 0.32,
                "emotional_response": "entertained",
                "strengths": ["Fast visual pacing", "Relatable college context", "Good meme format"],
                "weaknesses": ["Payoff in middle could be punchier"],
                "reasoning": "I stopped scrolling because the hook caught my attention immediately with relatable humor. I would definitely share this to my group chat, though I might scroll if the middle drags.",
                "metadata": {"mock_engine": "deterministic_v1"},
            }
        elif "casual" in low_name:
            data = {
                "persona_name": persona_name,
                "stop_scroll": 0.64,
                "watch_probability": 0.48,
                "completion_probability": 0.35,
                "like_probability": 0.42,
                "comment_probability": 0.15,
                "share_probability": 0.38,
                "save_probability": 0.18,
                "follow_probability": 0.12,
                "emotional_response": "indifferent",
                "strengths": ["Clear visual text hook"],
                "weaknesses": ["Lacks immediate dopamine hit", "Takes 4+ seconds to explain the point"],
                "reasoning": "I'm just scrolling through my feed to pass time. The first second was fine, but without an immediate high-energy visual I'd probably swipe up to the next video.",
                "metadata": {"mock_engine": "deterministic_v1"},
            }
        elif "creator" in low_name:
            data = {
                "persona_name": persona_name,
                "stop_scroll": 0.75,
                "watch_probability": 0.70,
                "completion_probability": 0.68,
                "like_probability": 0.60,
                "comment_probability": 0.55,
                "share_probability": 0.62,
                "save_probability": 0.72,
                "follow_probability": 0.40,
                "emotional_response": "curious",
                "strengths": ["Solid pattern-interrupt hook", "Good retention structure"],
                "weaknesses": ["Call to action feels slightly abrupt", "Lighting could be sharper"],
                "reasoning": "As a creator, I analyzed the storytelling arc. The hook establishes an open loop effectively, making me save it as a reference, but the ending CTA feels tacked on.",
                "metadata": {"mock_engine": "deterministic_v1"},
            }
        elif "skeptic" in low_name:
            data = {
                "persona_name": persona_name,
                "stop_scroll": 0.52,
                "watch_probability": 0.45,
                "completion_probability": 0.40,
                "like_probability": 0.28,
                "comment_probability": 0.68,
                "share_probability": 0.22,
                "save_probability": 0.30,
                "follow_probability": 0.15,
                "emotional_response": "skeptical",
                "strengths": ["Bold premise"],
                "weaknesses": ["Exaggerated claim without early evidence", "Feels like typical engagement bait"],
                "reasoning": "The headline sounds too good to be true. Without verifiable proof in the first few seconds, I suspect it's clickbait designed to farm views.",
                "metadata": {"mock_engine": "deterministic_v1"},
            }
        elif "niche" in low_name or "expert" in low_name:
            data = {
                "persona_name": persona_name,
                "stop_scroll": 0.68,
                "watch_probability": 0.62,
                "completion_probability": 0.58,
                "like_probability": 0.54,
                "comment_probability": 0.50,
                "share_probability": 0.42,
                "save_probability": 0.65,
                "follow_probability": 0.35,
                "emotional_response": "inspired",
                "strengths": ["Accurate core concept", "Avoids major beginner clichés"],
                "weaknesses": ["Oversimplifies nuance for mass reach"],
                "reasoning": "The technical premise is sound. While it oversimplifies some edge cases for general viewers, it provides legitimate value without spreading misinformation.",
                "metadata": {"mock_engine": "deterministic_v1"},
            }
        else:
            data = {
                "persona_name": persona_name,
                "stop_scroll": 0.70,
                "watch_probability": 0.60,
                "completion_probability": 0.50,
                "like_probability": 0.55,
                "comment_probability": 0.35,
                "share_probability": 0.45,
                "save_probability": 0.40,
                "follow_probability": 0.25,
                "emotional_response": "curious",
                "strengths": ["Interesting hook", "Clear topic"],
                "weaknesses": ["Pacing could be tighter"],
                "reasoning": f"Evaluated as {persona_name}. The content has moderate appeal but needs stronger retention mechanisms.",
                "metadata": {"mock_engine": "deterministic_v1"},
            }

        return json.dumps(data, indent=2)
