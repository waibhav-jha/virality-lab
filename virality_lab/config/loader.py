"""
Persona configuration loader.
Loads and validates persona profiles from YAML configuration files.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml

from virality_lab.core.persona import AttentionSpan, Persona
from virality_lab.scoring.config import ScoringConfig
from virality_lab.optimizer.config import OptimizationConfig

DEFAULT_CONFIG_PATH = Path(__file__).parent / "personas.yaml"
DEFAULT_SCORING_PATH = Path(__file__).parent.parent.parent / "config" / "scoring.yaml"
DEFAULT_OPTIMIZATION_PATH = Path(__file__).parent.parent.parent / "config" / "optimization.yaml"


def load_scoring_config(file_path: Optional[str] = None) -> ScoringConfig:
    """Load scoring configuration from YAML."""
    path = Path(file_path) if file_path else DEFAULT_SCORING_PATH
    return ScoringConfig.from_yaml(path)


def load_optimization_config(file_path: Optional[str] = None) -> OptimizationConfig:
    """Load optimization configuration from YAML."""
    path = Path(file_path) if file_path else DEFAULT_OPTIMIZATION_PATH
    return OptimizationConfig.from_yaml(path)


def load_personas_from_yaml(file_path: Optional[str] = None) -> List[Persona]:
    """
    Load and validate personas from a YAML configuration file.
    
    Args:
        file_path: Optional path to YAML configuration. Defaults to package personas.yaml.
        
    Returns:
        List of validated Persona instances.
    """
    path = Path(file_path) if file_path else DEFAULT_CONFIG_PATH

    if not path.exists():
        raise FileNotFoundError(f"Persona configuration file not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not data or not isinstance(data, dict):
        raise ValueError(f"Invalid YAML structure in {path}. Expected root dictionary with 'personas' list.")

    raw_personas = data.get("personas", [])
    if not isinstance(raw_personas, list):
        raise ValueError(f"'personas' key in {path} must contain a list of persona definitions.")

    personas: List[Persona] = []
    for item in raw_personas:
        # Convert age_range list to tuple if necessary
        if "age_range" in item and isinstance(item["age_range"], list):
            item["age_range"] = tuple(item["age_range"])

        # Convert attention_span string to enum
        if "attention_span" in item and isinstance(item["attention_span"], str):
            item["attention_span"] = AttentionSpan(item["attention_span"].lower())

        persona = Persona(**item)
        personas.append(persona)

    return personas


def load_default_personas() -> List[Persona]:
    """Load default 5 personas from the packaged personas.yaml."""
    return load_personas_from_yaml(str(DEFAULT_CONFIG_PATH))


def create_agent_from_persona(
    persona: Persona,
    agent_type: str = "mock",
    provider: Optional[Any] = None,
) -> Any:
    """
    Factory function to instantiate an AudienceAgent from a Persona.
    
    Args:
        persona: Persona profile.
        agent_type: "mock" (default, offline deterministic) or "llm" (uses LLMProvider).
        provider: Optional LLMProvider instance when agent_type="llm".
    """
    if agent_type.lower() == "mock":
        from virality_lab.agents.mock_agent import MockAudienceAgent
        return MockAudienceAgent(persona=persona)
    elif agent_type.lower() == "llm":
        from virality_lab.agents.audience_agent import LLMAudienceAgent
        return LLMAudienceAgent(persona=persona, provider=provider)
    else:
        raise ValueError(f"Unknown agent_type '{agent_type}'. Expected 'mock' or 'llm'.")


def create_default_agents(
    agent_type: str = "mock",
    provider: Optional[Any] = None,
) -> List[Any]:
    """
    Create agents for all 5 default personas loaded from YAML configuration.
    """
    personas = load_default_personas()
    return [create_agent_from_persona(p, agent_type=agent_type, provider=provider) for p in personas]
