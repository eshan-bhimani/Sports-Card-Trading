from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict
import logging

from config import settings
from utils.image_processor import CardCropper

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
    version="1.0.0"
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


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "1.0.0"
    }


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint with API information."""
    return {
        "message": "Baseball Card Auto-Cropping API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.post("/api/crop-image")
async def crop_image(file: UploadFile = File(...)) -> JSONResponse:
    """
    Accepts an image file and returns a cropped baseball card image.

    Args:
        file: Image file (JPEG, PNG) containing a baseball card

    Returns:
        JSON response with:
        - success: boolean
        - cropped_image: base64 encoded cropped image
        - confidence: confidence score (0-1)
        - message: status message
        - original_size: original image dimensions
        - cropped_size: cropped image dimensions
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

        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development"
    )
