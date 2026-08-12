"""
Media Upload Route.
Handles secure file uploads (PNG, JPG, WEBP, MP4, MOV) with size and MIME validation.
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from virality_lab.api.dependencies import get_media_storage
from virality_lab.api.schemas import UploadResponse
from virality_lab.storage.media import MediaStorage

router = APIRouter(prefix="/api", tags=["Media Upload"])


@router.post("/upload", response_model=UploadResponse, summary="Upload Media Asset")
async def upload_media(
    file: UploadFile = File(...),
    storage: MediaStorage = Depends(get_media_storage),
):
    """
    Accepts image or video file uploads for multi-modal analysis.
    Validates file size (max 50MB by default), extension, and MIME format.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

    content = await file.read()

    try:
        saved_path = storage.save(
            filename=file.filename,
            content=content,
            content_type=file.content_type,
        )
        return UploadResponse(
            file_path=saved_path,
            filename=file.filename,
            size_bytes=len(content),
            mime_type=file.content_type,
        )
    except ValueError as exc:
        msg = str(exc)
        if "exceeds maximum limit" in msg:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=msg)
        if "Unsupported" in msg:
            raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
