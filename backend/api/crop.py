"""
Crop router — extracted from the original monolithic app.py.

The CardCropper is lazy-initialized on first request so a CV startup failure
doesn't prevent the rest of the API from serving (auth, collections, etc.).
"""
import base64
import logging
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile
from fastapi.responses import JSONResponse

from config import settings
from utils.gcs_uploader import GCSUploader, GCSUploadError
from utils.image_processor import CardCropper

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Lazy singletons ───────────────────────────────────────────────────────────
_card_cropper: Optional[CardCropper] = None
_gcs_uploader: Optional[GCSUploader] = None


def _get_cropper() -> CardCropper:
    global _card_cropper
    if _card_cropper is None:
        _card_cropper = CardCropper()
    return _card_cropper


def _get_uploader() -> GCSUploader:
    global _gcs_uploader
    if _gcs_uploader is not None:
        return _gcs_uploader
    if not settings.gcs_upload_enabled:
        raise HTTPException(
            status_code=503,
            detail="GCS uploads are not enabled. Set GCS_UPLOAD_ENABLED=true and GCS_BUCKET_NAME.",
        )
    if not settings.gcs_bucket_name:
        raise HTTPException(status_code=503, detail="GCS_BUCKET_NAME is not configured.")
    try:
        _gcs_uploader = GCSUploader(
            bucket_name=settings.gcs_bucket_name,
            credentials_path=settings.gcs_credentials_path,
            default_user_id=settings.gcs_default_user_id,
            signed_url_expiration_minutes=settings.gcs_signed_url_expiration_minutes,
        )
        return _gcs_uploader
    except GCSUploadError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


def _decode_data_url(data_url: str) -> bytes:
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    return base64.b64decode(data_url)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/crop-image")
async def crop_image(
    request: Request,
    file: UploadFile = File(...),
    upload: bool = Query(default=False, description="Upload cropped image to GCS"),
    user_id: Optional[str] = Query(default=None),
    card_id: Optional[str] = Query(default=None),
) -> JSONResponse:
    """
    Detect and crop a baseball card from a photo.
    Returns base64-encoded PNG, confidence score, and dimensions.
    Optionally uploads the cropped image to GCS when upload=true.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG or PNG)")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_image_size_mb:
        raise HTTPException(
            status_code=400,
            detail=f"File size {size_mb:.1f}MB exceeds the {settings.max_image_size_mb}MB limit",
        )

    logger.info("Cropping %s (%.2f MB)", file.filename, size_mb)

    try:
        result = _get_cropper().crop_card(contents)
    except Exception as exc:
        logger.error("CardCropper raised an unexpected error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Image processing failed")

    if not result["success"]:
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": result["message"],
                "error": result.get("error", "Card detection failed"),
            },
        )

    logger.info("Cropped %s — confidence %.2f", file.filename, result["confidence"])

    if upload:
        try:
            uploader = _get_uploader()
            stem = (file.filename or "card").rsplit(".", 1)[0]
            upload_result = uploader.upload_image(
                image_bytes=_decode_data_url(result["cropped_image"]),
                filename=f"{stem}.png",
                content_type="image/png",
                user_id=user_id,
                card_id=card_id,
                metadata={
                    "confidence": str(result["confidence"]),
                    "original_filename": file.filename or "unknown",
                },
            )
            result["upload_result"] = upload_result
            logger.info("GCS upload succeeded: %s", upload_result["blob_path"])
        except (HTTPException, GCSUploadError) as exc:
            msg = exc.detail if isinstance(exc, HTTPException) else str(exc)
            result["upload_result"] = {"error": msg}
            logger.warning("GCS upload failed (non-fatal): %s", msg)

    return JSONResponse(content=result)
