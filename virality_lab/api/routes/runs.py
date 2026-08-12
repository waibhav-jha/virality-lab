"""
End-to-End Pipeline Execution and Run State Routes.
Supports synchronous and background asynchronous execution, progress tracking, and run retrieval.
"""

from typing import Any, List, Optional, Union
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from virality_lab.api.dependencies import get_engine, get_run_store
from virality_lab.api.schemas import FullAnalysisRequest, FullAnalysisResponse, JobStatusResponse
from virality_lab.core.content import Content
from virality_lab.engine.virality_lab_engine import PipelineMode, ViralityLabEngine, generate_run_id
from virality_lab.storage.runs import JobStatus, PipelineStage, RunStore

router = APIRouter(prefix="/api", tags=["Pipeline & Runs"])


def _run_background_pipeline(
    engine: ViralityLabEngine,
    content: Content,
    goal: Any,
    optimization_enabled: bool,
    optimization_iterations: int,
    persona_names: Optional[List[str]],
    run_id: str,
) -> None:
    """Helper worker for background task execution."""
    try:
        engine.run(
            content=content,
            mode=PipelineMode.FULL,
            objective=goal,
            optimization_enabled=optimization_enabled,
            optimization_iterations=optimization_iterations,
            persona_names=persona_names,
            run_id=run_id,
        )
    except Exception:
        # Errors are handled and persisted inside engine.run
        pass


@router.post(
    "/run",
    response_model=Union[FullAnalysisResponse, JobStatusResponse],
    summary="Execute Full Pipeline",
)
async def run_pipeline(
    request: FullAnalysisRequest,
    background_tasks: BackgroundTasks,
    engine: ViralityLabEngine = Depends(get_engine),
    run_store: RunStore = Depends(get_run_store),
):
    """
    Executes the end-to-end Virality Lab pipeline.
    If async_execution=True, initiates background job and returns immediately with run_id.
    If async_execution=False, waits synchronously and returns complete analysis payload.
    """
    content = request.content.to_content()

    run_id = generate_run_id()
    selected_personas = None
    if request.target_audience and request.target_audience.selected_personas:
        selected_personas = request.target_audience.selected_personas

    if request.async_execution:
        # Queue in run store
        run_store.create_job(
            run_id=run_id,
            request_data={
                "content_id": content.id,
                "platform": content.platform.value,
                "optimization_enabled": request.optimization_enabled,
            },
        )
        background_tasks.add_task(
            _run_background_pipeline,
            engine=engine,
            content=content,
            goal=request.goal,
            optimization_enabled=request.optimization_enabled,
            optimization_iterations=request.optimization_iterations,
            persona_names=selected_personas,
            run_id=run_id,
        )
        return JobStatusResponse(
            run_id=run_id,
            status=JobStatus.QUEUED,
            stage=PipelineStage.QUEUED,
            progress=0,
            message="Pipeline job queued in background.",
        )

    # Synchronous execution
    result_dict = engine.run(
        content=content,
        mode=PipelineMode.FULL,
        objective=request.goal,
        optimization_enabled=request.optimization_enabled,
        optimization_iterations=request.optimization_iterations,
        persona_names=selected_personas,
        run_id=run_id,
    )

    return FullAnalysisResponse(
        run_id=result_dict.get("run_id", run_id),
        status=result_dict.get("status", "completed"),
        content=result_dict.get("content"),
        content_profile=result_dict.get("content_profile"),
        simulation=result_dict.get("simulation"),
        score=result_dict.get("score"),
        optimization=result_dict.get("optimization"),
        best_content=result_dict.get("best_content"),
        best_score=result_dict.get("best_score"),
        overall_improvement=result_dict.get("overall_improvement"),
    )


@router.get("/runs/{run_id}", response_model=JobStatusResponse, summary="Get Run Status & Result")
async def get_run_status(
    run_id: str,
    run_store: RunStore = Depends(get_run_store),
):
    """
    Polls status, progress, stage, errors, or final completed payload for a specific run_id.
    """
    job = run_store.get_job(run_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found.",
        )

    return JobStatusResponse(
        run_id=job.run_id,
        status=job.status,
        stage=job.stage,
        progress=job.progress,
        message=job.message,
        result=job.result_data,
        error=job.error_data,
    )


@router.get("/runs", response_model=List[JobStatusResponse], summary="List Recent Runs")
async def list_runs(
    limit: int = Query(default=20, ge=1, le=100),
    run_store: RunStore = Depends(get_run_store),
):
    """
    Returns history of recent pipeline runs.
    """
    jobs = run_store.list_jobs(limit=limit)
    return [
        JobStatusResponse(
            run_id=j.run_id,
            status=j.status,
            stage=j.stage,
            progress=j.progress,
            message=j.message,
            result=j.result_data,
            error=j.error_data,
        )
        for j in jobs
    ]
