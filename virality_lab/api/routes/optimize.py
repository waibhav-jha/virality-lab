"""
Content Optimization Route.
Generates targeted content variants and re-evaluates them to select optimal winners.
"""

from fastapi import APIRouter, Depends
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.api.dependencies import get_engine
from virality_lab.api.schemas import OptimizationRequest, OptimizationResponse
from virality_lab.core.content import Content
from virality_lab.engine.virality_lab_engine import ViralityLabEngine
from virality_lab.scoring.schemas import ViralityScore

router = APIRouter(prefix="/api", tags=["Content Optimization"])


@router.post("/optimize", response_model=OptimizationResponse, summary="Optimize Content Variants")
async def optimize_content(
    request: OptimizationRequest,
    engine: ViralityLabEngine = Depends(get_engine),
):
    """
    Generates targeted content variants, simulates candidate performance,
    audits regression guardrails, and deterministically selects the winning variant.
    """
    content = request.content.to_content()

    profile = ContentProfile.model_validate(request.content_profile) if request.content_profile else None
    score = ViralityScore.model_validate(request.virality_score) if request.virality_score else None

    result = engine.optimize(
        content=content,
        profile=profile,
        score=score,
        objective=request.objective,
        iterations=request.max_iterations,
    )

    return OptimizationResponse(
        optimization_result=result.model_dump(),
        original_score=result.original_score.overall_score,
        best_score=result.best_score.overall_score,
        overall_improvement=result.overall_improvement,
        best_content=result.best_content.model_dump(),
    )
