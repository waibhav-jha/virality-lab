"""
Audience Prompt Builder and templates for behavioral persona simulation.
Transforms Persona, ContentProfile, Platform, and Simulation Context into
rigorous, testable, LLM-friendly evaluation prompts.
"""

from typing import Any, Dict, Optional, Tuple
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.analyzer.serializer import ContentProfileSerializer
from virality_lab.core.content import Content, Platform
from virality_lab.core.persona import Persona


SIMULATION_SYSTEM_PROMPT_HEADER = """You are a specialized behavioral audience simulation agent inside the Virality Lab pre-publication testing engine.

SCIENTIFIC PRINCIPLE & SIMULATION BOUNDARIES:
- You are simulating ONE specific audience persona segment encountering content organically in their feed.
- You are NOT predicting the whole internet.
- You are NOT guaranteeing real-world virality or algorithmic outcomes.
- You are NOT a generic writing assistant offering feedback, nor a generic chatbot roleplaying internet slang.
- You MUST simulate how this specific persona would realistically behave, think, and react.

### TARGET SIMULATED AUDIENCE PERSONA:
{persona_profile}

### SIMULATION RULES & REASONING METHODOLOGY:
1. REASONING STRUCTURE: Your reasoning must strictly follow the causal chain:
   [CONTENT SIGNAL / HOOK / PACING] -> [PERSONA TRAIT / BIAS / ATTENTION LIMIT] -> [BEHAVIORAL PROBABILITY]
   Example: "The opening presents a concrete promise in the first 2 seconds. Because this persona has low attention span but high curiosity for AI tools, I would likely stop scrolling (0.85). However, the delayed payoff causes drop-off before completion (0.45)."

2. BEHAVIORAL ACTION PROBABILITIES (Estimate 0.00 to 1.00):
   - stop_scroll: Likelihood this persona stops scrolling when encountering the opening 0-3 seconds.
   - watch_probability: Likelihood this persona stays past the initial hook into the main body.
   - completion_probability: Likelihood this persona consumes the content through to the final payoff.
   - like_probability: Likelihood this persona taps like/heart.
   - comment_probability: Likelihood this persona writes a comment or joins discussion.
   - share_probability: Likelihood this persona forwards/DMs this to friends, group chats, or reposts.
   - save_probability: Likelihood this persona bookmarks/saves this for future reference.
   - follow_probability: Likelihood this persona visits the creator profile and follows.

3. EMOTIONAL RESPONSE:
   Select the dominant reaction from: "curious", "entertained", "skeptical", "indifferent", "amused", "excited", "inspired", "annoyed", "confused".

4. STRENGTHS & WEAKNESSES:
   - strengths: 2-3 specific content elements that successfully resonate with this persona.
   - weaknesses: 1-2 specific friction points, pacing flaws, or tone mismatches that cause drop-off or skepticism.
"""

SIMULATION_USER_PROMPT_TEMPLATE = """### EVALUATION ASSIGNMENT:
Platform: {platform}

### CONTENT PROFILE & INTELLIGENCE SIGNALS:
{content_context}

### TASK INSTRUCTIONS:
Evaluate this content strictly through the lens of your persona ({persona_name}).
1. How does the opening hook and format match your attention span ({attention_span}) and interests?
2. Do you trust the claims, or does your clickbait tolerance / skepticism trigger resistance?
3. Would you stop scrolling, watch through, like, comment, share, or save?

Respond strictly with a valid JSON object matching the Reaction schema:
{{
  "persona_name": "{persona_name}",
  "stop_scroll": float between 0.00 and 1.00,
  "watch_probability": float between 0.00 and 1.00,
  "completion_probability": float between 0.00 and 1.00,
  "like_probability": float between 0.00 and 1.00,
  "comment_probability": float between 0.00 and 1.00,
  "share_probability": float between 0.00 and 1.00,
  "save_probability": float between 0.00 and 1.00,
  "follow_probability": float between 0.00 and 1.00,
  "emotional_response": "curious" | "entertained" | "skeptical" | "indifferent" | "amused" | "excited" | "inspired" | "annoyed" | "confused",
  "strengths": ["string", "string"],
  "weaknesses": ["string"],
  "reasoning": "string explaining causal chain from content signals to persona behavior"
}}
"""


class AudiencePromptBuilder:
    """
    Dedicated prompt builder for LLM audience simulation agents.
    Decouples prompt assembly, serialization, and persona injection from the agent runner.
    """

    def __init__(
        self,
        serializer: Optional[ContentProfileSerializer] = None,
    ) -> None:
        self.serializer = serializer or ContentProfileSerializer()

    def build_system_prompt(self, persona: Persona) -> str:
        """Construct the complete system prompt for a persona simulation agent."""
        return SIMULATION_SYSTEM_PROMPT_HEADER.format(
            persona_profile=persona.to_prompt_context()
        )

    def build_user_prompt(
        self,
        persona: Persona,
        content: Optional[Content] = None,
        profile: Optional[ContentProfile] = None,
        platform_override: Optional[Platform] = None,
        simulation_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Construct the user evaluation prompt containing serialized content signals."""
        content_context = self.serializer.serialize(
            content=content,
            profile=profile,
            platform_override=platform_override,
        )

        platform_str = (
            platform_override.value
            if platform_override
            else (
                content.platform.value
                if content
                else (profile.media_info.platform.value if profile else "generic")
            )
        )

        prompt = SIMULATION_USER_PROMPT_TEMPLATE.format(
            platform=platform_str.upper(),
            content_context=content_context,
            persona_name=persona.name,
            attention_span=persona.attention_span.value,
        )

        if simulation_context:
            extra_lines = ["\n### ADDITIONAL SIMULATION CONTEXT:"]
            for k, v in simulation_context.items():
                extra_lines.append(f"- **{k.replace('_', ' ').title()}**: {v}")
            prompt += "\n".join(extra_lines)

        return prompt

    def build_prompts(
        self,
        persona: Persona,
        content: Optional[Content] = None,
        profile: Optional[ContentProfile] = None,
        platform_override: Optional[Platform] = None,
        simulation_context: Optional[Dict[str, Any]] = None,
    ) -> Tuple[str, str]:
        """Convenience method returning both system and user prompts."""
        system_prompt = self.build_system_prompt(persona)
        user_prompt = self.build_user_prompt(
            persona=persona,
            content=content,
            profile=profile,
            platform_override=platform_override,
            simulation_context=simulation_context,
        )
        return system_prompt, user_prompt


def build_simulation_prompts(
    persona: Persona,
    content: Content,
    profile: Optional[ContentProfile] = None,
) -> Tuple[str, str]:
    """
    Backwards-compatible helper function for prompt generation.
    """
    builder = AudiencePromptBuilder()
    return builder.build_prompts(persona=persona, content=content, profile=profile)
