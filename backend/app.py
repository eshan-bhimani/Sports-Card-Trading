from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, Optional
import base64
import logging

from config import settings
from utils.image_processor import CardCropper
from utils.gcs_uploader import GCSUploader, GCSUploadError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Baseball Card Auto-Cropping API",
    description="API for automatically detecting and cropping baseball cards from photos",
    version="1.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize card cropper
card_cropper = CardCropper()

# Initialize GCS uploader (lazy — only created when GCS is configured)
_gcs_uploader: Optional[GCSUploader] = None


def get_gcs_uploader() -> GCSUploader:
    """Get or create the GCS uploader singleton. Raises if GCS is not configured."""
    global _gcs_uploader
    if _gcs_uploader is not None:
        return _gcs_uploader

    if not settings.gcs_upload_enabled:
        raise HTTPException(
            status_code=503,
            detail="GCS uploads are not enabled. Set GCS_UPLOAD_ENABLED=true and configure GCS_BUCKET_NAME."
        )
    if not settings.gcs_bucket_name:
        raise HTTPException(
            status_code=503,
            detail="GCS_BUCKET_NAME is not configured."
        )

    try:
        _gcs_uploader = GCSUploader(
            bucket_name=settings.gcs_bucket_name,
            credentials_path=settings.gcs_credentials_path,
            default_user_id=settings.gcs_default_user_id,
            signed_url_expiration_minutes=settings.gcs_signed_url_expiration_minutes,
        )
        return _gcs_uploader
    except GCSUploadError as e:
        raise HTTPException(status_code=503, detail=str(e))


def _decode_base64_data_url(data_url: str) -> bytes:
    """Extract raw image bytes from a base64 data URL (data:image/png;base64,...)."""
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    return base64.b64decode(data_url)


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "1.1.0",
        "gcs_enabled": str(settings.gcs_upload_enabled),
    }


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint with API information."""
    return {
        "message": "Baseball Card Auto-Cropping API",
        "version": "1.1.0",
        "docs": "/docs"
    }


# ---------------------------------------------------------------------------
# Existing endpoint — preserved as-is, with optional upload=true flag
# ---------------------------------------------------------------------------

@app.post("/api/crop-image")
async def crop_image(
    file: UploadFile = File(...),
    upload: bool = Query(default=False, description="If true, upload the cropped image to GCS after processing"),
    user_id: Optional[str] = Query(default=None, description="User folder for GCS storage"),
    card_id: Optional[str] = Query(default=None, description="Card identifier for GCS path"),
) -> JSONResponse:
    """
    Accepts an image file and returns a cropped baseball card image.

    Args:
        file: Image file (JPEG, PNG) containing a baseball card
        upload: If true, automatically upload the cropped image to GCS
        user_id: Optional user identifier for GCS path organization
        card_id: Optional card identifier for GCS naming

    Returns:
        JSON response with:
        - success: boolean
        - cropped_image: base64 encoded cropped image
        - confidence: confidence score (0-1)
        - message: status message
        - original_size: original image dimensions
        - cropped_size: cropped image dimensions
        - upload_result: (only if upload=true) GCS upload metadata
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPEG or PNG)"
            )

        # Read file contents
        contents = await file.read()

        # Validate file size
        file_size_mb = len(contents) / (1024 * 1024)
        if file_size_mb > settings.max_image_size_mb:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({file_size_mb:.2f}MB) exceeds maximum allowed size ({settings.max_image_size_mb}MB)"
            )

        logger.info(f"Processing image: {file.filename} ({file_size_mb:.2f}MB)")

        # Process image
        result = card_cropper.crop_card(contents)

        if not result["success"]:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": result["message"],
                    "error": result.get("error", "Card detection failed")
                }
            )

        logger.info(f"Successfully cropped image with confidence {result['confidence']:.2f}")

        # Optional GCS upload
        if upload:
            try:
                uploader = get_gcs_uploader()
                image_bytes = _decode_base64_data_url(result["cropped_image"])
                filename = file.filename or "card.png"
                # Use the original filename stem with .png extension
                stem = filename.rsplit(".", 1)[0] if "." in filename else filename
                upload_filename = f"{stem}.png"

                upload_result = uploader.upload_image(
                    image_bytes=image_bytes,
                    filename=upload_filename,
                    content_type="image/png",
                    user_id=user_id,
                    card_id=card_id,
                    metadata={
                        "confidence": str(result["confidence"]),
                        "original_filename": file.filename or "unknown",
                    },
                )
                result["upload_result"] = upload_result
                logger.info(f"Image uploaded to GCS: {upload_result['blob_path']}")
            except (HTTPException, GCSUploadError) as e:
                # Upload failure should not break the crop response
                error_msg = str(e.detail) if isinstance(e, HTTPException) else str(e)
                result["upload_result"] = {"error": error_msg}
                logger.warning(f"GCS upload failed (non-fatal): {error_msg}")

        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# ---------------------------------------------------------------------------
# New endpoint — direct upload of an already-processed image
# ---------------------------------------------------------------------------

@app.post("/api/upload")
async def upload_image(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(default=None, description="User folder for GCS storage"),
    card_id: Optional[str] = Form(default=None, description="Card identifier for GCS path"),
) -> JSONResponse:
    """
    Upload a processed card image directly to GCS.

    Use this endpoint when you already have a cropped/oriented image and want
    to upload it without re-processing.

    Args:
        file: Image file (JPEG or PNG) to upload.
        user_id: User folder for organized storage (default: admin).
        card_id: Card identifier; auto-generated if omitted.

    Returns:
        JSON with upload metadata (blob_path, bucket, urls, size, timestamp).
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPEG or PNG)"
            )

        contents = await file.read()
        file_size_mb = len(contents) / (1024 * 1024)
        if file_size_mb > settings.max_image_size_mb:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({file_size_mb:.2f}MB) exceeds maximum allowed size ({settings.max_image_size_mb}MB)"
            )

        uploader = get_gcs_uploader()

        filename = file.filename or "card.png"
        upload_result = uploader.upload_image(
            image_bytes=contents,
            filename=filename,
            content_type=file.content_type or "image/png",
            user_id=user_id,
            card_id=card_id,
        )

        logger.info(f"Direct upload to GCS: {upload_result['blob_path']}")
        return JSONResponse(content={"success": True, **upload_result})

    except HTTPException:
        raise
    except GCSUploadError as e:
        logger.error(f"GCS upload error: {e}")
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# ---------------------------------------------------------------------------
# Upload status check — verifies GCS connectivity
# ---------------------------------------------------------------------------

@app.get("/api/upload/status")
async def upload_status() -> JSONResponse:
    """
    Check whether the GCS upload service is configured and reachable.

    Returns:
        JSON with enabled flag and connection status.
    """
    if not settings.gcs_upload_enabled:
        return JSONResponse(content={
            "enabled": False,
            "message": "GCS uploads are disabled. Set GCS_UPLOAD_ENABLED=true.",
        })

    try:
        uploader = get_gcs_uploader()
        connected = uploader.check_connection()
        return JSONResponse(content={
            "enabled": True,
            "connected": connected,
            "bucket": settings.gcs_bucket_name,
        })
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"enabled": True, "connected": False, "error": e.detail},
        )


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development"
    )
