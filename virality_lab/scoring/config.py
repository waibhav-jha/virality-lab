"""
Scoring configuration and platform modifier models.
Provides validated, serializable scoring weights and platform adaptation logic.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml
from pydantic import BaseModel, Field, field_validator

from virality_lab.core.content import Platform


class MetricSubWeights(BaseModel):
    """Sub-weights for behavioral metrics within individual components."""

    retention: Dict[str, float] = Field(
        default_factory=lambda: {"stop_scroll": 0.30, "watch": 0.30, "completion": 0.40}
    )
    sharing: Dict[str, float] = Field(
        default_factory=lambda: {"share": 1.00}
    )
    engagement: Dict[str, float] = Field(
        default_factory=lambda: {"like": 0.25, "comment": 0.30, "save": 0.45}
    )
    conversion: Dict[str, float] = Field(
        default_factory=lambda: {"follow": 1.00}
    )

    @field_validator("retention", "sharing", "engagement", "conversion")
    @classmethod
    def validate_block_sums(cls, v: Dict[str, float], info) -> Dict[str, float]:
        total = sum(v.values())
        if abs(total - 1.0) > 0.01:
            raise ValueError(f"Metric weights block for '{info.field_name}' must sum to 1.0, got {total:.3f}")
        for k, val in v.items():
            if val < 0.0:
                raise ValueError(f"Metric weight for '{k}' cannot be negative: {val}")
        return v


class ScoringConfig(BaseModel):
    """
    Complete configuration for the Virality Scoring Engine.
    Defines component weights, metric sub-weights, platform overrides, and custom persona weighting.
    """

    component_weights: Dict[str, float] = Field(
        default_factory=lambda: {
            "retention": 0.35,
            "sharing": 0.30,
            "engagement": 0.25,
            "conversion": 0.10,
        }
    )
    metric_weights: MetricSubWeights = Field(default_factory=MetricSubWeights)
    platform_modifiers: Dict[str, Dict[str, float]] = Field(
        default_factory=lambda: {
            "tiktok": {"retention": 0.40, "sharing": 0.30, "engagement": 0.20, "conversion": 0.10},
            "instagram_reels": {"retention": 0.30, "sharing": 0.35, "engagement": 0.25, "conversion": 0.10},
            "youtube_shorts": {"retention": 0.45, "sharing": 0.20, "engagement": 0.25, "conversion": 0.10},
            "linkedin": {"retention": 0.20, "sharing": 0.30, "engagement": 0.40, "conversion": 0.10},
            "x": {"retention": 0.20, "sharing": 0.40, "engagement": 0.30, "conversion": 0.10},
        }
    )
    persona_weights: Dict[str, float] = Field(default_factory=dict)
    scale_max: float = Field(default=100.0, ge=1.0)
    decimals: int = Field(default=1, ge=0, le=4)

    @field_validator("component_weights")
    @classmethod
    def validate_component_weights(cls, v: Dict[str, float]) -> Dict[str, float]:
        required = {"retention", "sharing", "engagement", "conversion"}
        if not required.issubset(v.keys()):
            raise ValueError(f"component_weights must define all of {required}, got {set(v.keys())}")
        total = sum(v.values())
        if abs(total - 1.0) > 0.01:
            raise ValueError(f"component_weights must sum to 1.0, got {total:.3f}")
        for k, val in v.items():
            if val < 0.0:
                raise ValueError(f"Component weight '{k}' cannot be negative: {val}")
        return v

    def get_component_weights(self, platform: Optional[Any] = None) -> Dict[str, float]:
        """
        Get active component weights for a given platform.
        Falls back to base component_weights if platform modifier is not defined.
        """
        if platform is None:
            return dict(self.component_weights)

        plat_key = platform.value.lower() if isinstance(platform, Platform) else str(platform).lower().strip()
        if plat_key in self.platform_modifiers:
            weights = self.platform_modifiers[plat_key]
            total = sum(weights.values())
            if abs(total - 1.0) <= 0.01:
                return dict(weights)

        return dict(self.component_weights)

    def get_persona_weights(self, persona_names: List[str]) -> Dict[str, float]:
        """
        Get normalized weights for evaluated personas.
        Defaults to equal weighting (1.0 / N) if custom weights are not configured.
        """
        if not persona_names:
            return {}

        if self.persona_weights:
            weights = {p: self.persona_weights.get(p, 1.0) for p in persona_names}
            total = sum(weights.values())
            if total > 0:
                return {p: w / total for p, w in weights.items()}

        # Default equal weighting
        equal = 1.0 / len(persona_names)
        return {p: equal for p in persona_names}

    @classmethod
    def from_yaml(cls, path: Optional[Path | str] = None) -> "ScoringConfig":
        """Load ScoringConfig from a YAML file, or default if path is None."""
        if path is None:
            # Look in standard repo location
            root_dir = Path(__file__).resolve().parent.parent.parent
            default_path = root_dir / "config" / "scoring.yaml"
            if default_path.is_file():
                path = default_path
            else:
                return cls()

        target = Path(path)
        if not target.is_file():
            return cls()

        with open(target, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        # Parse nested structure
        component_weights = data.get("component_weights")
        metric_raw = data.get("metric_weights", {})
        metric_weights = MetricSubWeights(**metric_raw) if metric_raw else MetricSubWeights()
        platform_modifiers = data.get("platform_modifiers", {})
        persona_weights = data.get("persona_weights", {})
        norm = data.get("normalization", {})

        kwargs: Dict[str, Any] = {
            "metric_weights": metric_weights,
            "platform_modifiers": platform_modifiers,
            "persona_weights": persona_weights,
            "scale_max": norm.get("scale_max", 100.0),
            "decimals": norm.get("decimals", 1),
        }
        if component_weights:
            kwargs["component_weights"] = component_weights

        return cls(**kwargs)
