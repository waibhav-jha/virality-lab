"""
Base Audience Agent abstraction and prompt builder.
All agent implementations (LLM-based, rule-based, mock, human-calibrated) inherit from AudienceAgent.
"""

from abc import ABC, abstractmethod
from typing import Optional, Tuple
from virality_lab.core.content import Content
from virality_lab.core.persona import Persona
from virality_lab.core.reaction import Reaction
from virality_lab.llm.prompt_templates import build_simulation_prompts


class PromptBuilder:
    """Utility class for assembling system and user prompts for persona simulations."""

    @staticmethod
    def build(persona: Persona, content: Content) -> Tuple[str, str]:
        """Generate formatted system and user prompts."""
        return build_simulation_prompts(persona, content)


class AudienceAgent(ABC):
    """
    Abstract Base Class for an Audience Agent.
    Encapsulates a specific Persona and evaluates Content to produce a Reaction.
    """

    def __init__(self, persona: Persona) -> None:
        if not isinstance(persona, Persona):
            raise TypeError(f"Expected persona to be an instance of Persona, got {type(persona).__name__}")
        self.persona: Persona = persona

    @property
    def name(self) -> str:
        """Name of the audience persona."""
        return self.persona.name

    @abstractmethod
    def evaluate(self, content: Content) -> Reaction:
        """
        Evaluate social media content from this persona's perspective.
        
        Args:
            content: The standardized Content item to evaluate.
            
        Returns:
            Reaction: Validated structured behavioral prediction and reasoning.
        """
        pass

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(persona='{self.persona.name}')>"
