"""
Direct GCS upload endpoints — extracted from the original app.py.
"""
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from api.crop import _get_uploader          # share the same lazy singleton
from config import settings
from utils.gcs_uploader import GCSUploadError

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(default=None),
    card_id: Optional[str] = Form(default=None),
) -> JSONResponse:
    """Upload a pre-processed card image directly to GCS."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG or PNG)")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_image_size_mb:
        raise HTTPException(
            status_code=400,
            detail=f"File size {size_mb:.1f}MB exceeds the {settings.max_image_size_mb}MB limit",
        )

    try:
        uploader = _get_uploader()
        result = uploader.upload_image(
            image_bytes=contents,
            filename=file.filename or "card.png",
            content_type=file.content_type or "image/png",
            user_id=user_id,
            card_id=card_id,
        )
        logger.info("Direct GCS upload: %s", result["blob_path"])
        return JSONResponse(content={"success": True, **result})
    except HTTPException:
        raise
    except GCSUploadError as exc:
        logger.error("GCS upload error: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.error("Upload error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/upload/status")
async def upload_status() -> JSONResponse:
    """Check GCS connectivity."""
    if not settings.gcs_upload_enabled:
        return JSONResponse(content={"enabled": False, "message": "GCS uploads are disabled."})
    try:
        uploader = _get_uploader()
        connected = uploader.check_connection()
        return JSONResponse(content={"enabled": True, "connected": connected, "bucket": settings.gcs_bucket_name})
    except HTTPException as exc:
        return JSONResponse(
            status_code=exc.status_code,
            content={"enabled": True, "connected": False, "error": exc.detail},
        )
