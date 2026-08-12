"""
Standard API Exception Handlers and Error Models.
Ensures uniform JSON error responses across all routes and prevents stack trace leakage.
"""

from typing import Optional
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from virality_lab.api.schemas import ErrorDetail, ErrorResponse


class ViralityLabAPIException(Exception):
    """Base exception for application-level API errors."""

    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, run_id: Optional[str] = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.run_id = run_id
        super().__init__(message)


def register_exception_handlers(app: FastAPI) -> None:
    """Register uniform global exception handlers on FastAPI app."""

    @app.exception_handler(ViralityLabAPIException)
    async def virality_lab_exception_handler(request: Request, exc: ViralityLabAPIException) -> JSONResponse:
        payload = ErrorResponse(
            error=ErrorDetail(code=exc.code, message=exc.message, run_id=exc.run_id)
        ).model_dump()
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        err_msg = "; ".join([f"{'.'.join(str(loc) for loc in e.get('loc', []))}: {e.get('msg', '')}" for e in errors])
        payload = ErrorResponse(
            error=ErrorDetail(code="VALIDATION_ERROR", message=err_msg)
        ).model_dump()
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=payload)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        code_map = {
            status.HTTP_404_NOT_FOUND: "NOT_FOUND",
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: "PAYLOAD_TOO_LARGE",
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
            status.HTTP_429_TOO_MANY_REQUESTS: "RATE_LIMITED",
            status.HTTP_500_INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
        }
        code = code_map.get(exc.status_code, "HTTP_ERROR")
        payload = ErrorResponse(
            error=ErrorDetail(code=code, message=str(exc.detail))
        ).model_dump()
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        payload = ErrorResponse(
            error=ErrorDetail(code="INVALID_INPUT", message=str(exc))
        ).model_dump()
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=payload)

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        payload = ErrorResponse(
            error=ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected internal server error occurred while processing the request.",
            )
        ).model_dump()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=payload)
