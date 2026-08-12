"""
Virality Lab Content Optimization Engine.
"""

from virality_lab.optimizer.config import GuardrailConfig, OptimizationConfig
from virality_lab.optimizer.diagnostics_mapper import DiagnosticActionPlan, DiagnosticsMapper
from virality_lab.optimizer.engine import OptimizationEngine
from virality_lab.optimizer.evaluator import VariantEvaluator
from virality_lab.optimizer.generator import (
    BaseContentOptimizer,
    LLMContentOptimizer,
    MockContentOptimizer,
)
from virality_lab.optimizer.schemas import (
    ContentVariant,
    EvaluatedVariant,
    OptimizationComparison,
    OptimizationIteration,
    OptimizationObjective,
    OptimizationResult,
    OptimizationTarget,
)
from virality_lab.optimizer.selector import VariantSelector
from virality_lab.optimizer.strategies import (
    BaseOptimizationStrategy,
    CaptionOptimizationStrategy,
    CTAOptimizationStrategy,
    HookOptimizationStrategy,
    ShareabilityOptimizationStrategy,
    StructureOptimizationStrategy,
)

__all__ = [
    "OptimizationEngine",
    "OptimizationConfig",
    "GuardrailConfig",
    "DiagnosticsMapper",
    "DiagnosticActionPlan",
    "VariantEvaluator",
    "VariantSelector",
    "BaseContentOptimizer",
    "LLMContentOptimizer",
    "MockContentOptimizer",
    "ContentVariant",
    "EvaluatedVariant",
    "OptimizationComparison",
    "OptimizationIteration",
    "OptimizationObjective",
    "OptimizationResult",
    "OptimizationTarget",
    "BaseOptimizationStrategy",
    "HookOptimizationStrategy",
    "CaptionOptimizationStrategy",
    "StructureOptimizationStrategy",
    "CTAOptimizationStrategy",
    "ShareabilityOptimizationStrategy",
]
