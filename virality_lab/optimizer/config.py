"""
Configuration loader and models for the Content Optimization Engine.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml
from pydantic import BaseModel, Field

from virality_lab.optimizer.schemas import OptimizationObjective


class GuardrailConfig(BaseModel):
    """Regression protection thresholds and guardrails."""

    max_retention_drop_pct: float = Field(
        default=15.0, ge=0.0, le=100.0, description="Max percentage drop allowed in retention score."
    )
    max_component_drop_points: float = Field(
        default=15.0, ge=0.0, le=100.0, description="Max absolute points drop allowed in any single component."
    )
    require_positive_overall: bool = Field(
        default=True, description="Enforce that winning variant must not decrease overall virality score."
    )
    preserve_facts: bool = Field(
        default=True, description="Strictly prohibit inventing ungrounded statistics or claims."
    )
    preserve_intent: bool = Field(
        default=True, description="Preserve creator topic, platform, and core message identity."
    )


class OptimizationConfig(BaseModel):
    """Complete configuration for the Content Optimization Engine."""

    max_iterations: int = Field(default=1, ge=1, le=5, description="Maximum iterative refinement loops.")
    variants_per_iteration: int = Field(default=3, ge=1, le=10, description="Number of candidate variants generated per step.")
    minimum_improvement: float = Field(default=2.0, ge=0.0, description="Minimum points improvement required to accept a winner.")
    default_objective: OptimizationObjective = Field(default=OptimizationObjective.OVERALL)
    guardrails: GuardrailConfig = Field(default_factory=GuardrailConfig)
    strategy_priorities: List[str] = Field(
        default_factory=lambda: ["hook", "structure", "shareability", "caption", "cta"]
    )

    @classmethod
    def from_yaml(cls, path: Optional[Path | str] = None) -> "OptimizationConfig":
        """Load OptimizationConfig from a YAML file, falling back to default."""
        if path is None:
            root_dir = Path(__file__).resolve().parent.parent.parent
            default_path = root_dir / "config" / "optimization.yaml"
            if default_path.is_file():
                path = default_path
            else:
                return cls()

        target = Path(path)
        if not target.is_file():
            return cls()

        with open(target, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        opt_section = data.get("optimization", data)
        guard_raw = opt_section.get("guardrails", {})
        guardrails = GuardrailConfig(**guard_raw) if guard_raw else GuardrailConfig()

        raw_obj = opt_section.get("default_objective", "overall")
        try:
            objective = OptimizationObjective(raw_obj.lower())
        except ValueError:
            objective = OptimizationObjective.OVERALL

        return cls(
            max_iterations=opt_section.get("max_iterations", 1),
            variants_per_iteration=opt_section.get("variants_per_iteration", 3),
            minimum_improvement=opt_section.get("minimum_improvement", 2.0),
            default_objective=objective,
            guardrails=guardrails,
            strategy_priorities=opt_section.get("strategy_priorities", ["hook", "structure", "shareability", "caption", "cta"]),
        )
