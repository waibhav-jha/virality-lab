"""
Content Intelligence Analysis Route.
Extracts structural, stylistic, hook, and multimodal features without audience simulation.
"""

from fastapi import APIRouter, Depends
from virality_lab.api.dependencies import get_engine
from virality_lab.api.schemas import AnalyzeRequest, AnalyzeResponse
from virality_lab.core.content import Content
from virality_lab.engine.virality_lab_engine import ViralityLabEngine

router = APIRouter(prefix="/api", tags=["Content Intelligence"])


@router.post("/analyze", response_model=AnalyzeResponse, summary="Analyze Content Profile")
async def analyze_content(
    request: AnalyzeRequest,
    engine: ViralityLabEngine = Depends(get_engine),
):
    """
    Extracts deep structural features, hook strength, reading level, and style markers
    from the submitted content asset.
    """
    content = request.content.to_content()

    profile = engine.analyze(content)
    return AnalyzeResponse(
        content_profile=profile.model_dump(),
        summary=f"Analysis complete for {content.platform.value} {content.media_type.value}.",
    )
