# Baseball Card Auto-Cropping API

Backend API service for automatically detecting and cropping baseball cards from photos using OpenCV.

## Features

- Automatic card detection from photos
- Perspective correction for rotated cards
- Confidence scoring for detection quality
- RESTful API with automatic documentation
- Google Photos integration (Phase 2)

## Tech Stack

- **Framework**: FastAPI
- **Image Processing**: OpenCV, Pillow
- **Server**: Uvicorn
- **Python**: 3.9+

## Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. **Create and activate virtual environment**

```bash
# Create virtual environment
python3 -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Set up environment variables**

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration (optional for Phase 1)
```

### Running the Server

#### Development Mode

```bash
# With auto-reload
python app.py

# Or using uvicorn directly
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### Production Mode

```bash
# Set environment to production in .env
ENVIRONMENT=production

# Run with uvicorn
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check

```bash
GET /health
```

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

### Crop Image

```bash
POST /api/crop-image
```

Detects and crops a baseball card from an image.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file - JPEG or PNG)

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/api/crop-image" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/card-photo.jpg"
```

**Example using Python:**
```python
import requests

url = "http://localhost:8000/api/crop-image"
files = {"file": open("card-photo.jpg", "rb")}

response = requests.post(url, files=files)
result = response.json()

if result["success"]:
    print(f"Confidence: {result['confidence']}")
    print(f"Original size: {result['original_size']}")
    print(f"Cropped size: {result['cropped_size']}")
    # result['cropped_image'] contains base64 encoded image
```

**Success Response (200):**
```json
{
  "success": true,
  "cropped_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "confidence": 0.87,
  "message": "Card successfully detected and cropped",
  "original_size": [1920, 1080],
  "cropped_size": [500, 700]
}
```

**Error Response (422):**
```json
{
  "success": false,
  "message": "No card detected in image. Please ensure the card is clearly visible against a contrasting background.",
  "confidence": 0.0,
  "original_size": [1920, 1080]
}
```

## Card Detection Algorithm

The service uses a multi-step computer vision pipeline:

1. **Preprocessing**
   - Convert to grayscale
   - Apply Gaussian blur (noise reduction)
   - Adaptive thresholding + Canny edge detection

2. **Contour Detection**
   - Find external contours
   - Filter by size (minimum 5% of image area)
   - Filter by shape (4-6 vertices for rectangles)

3. **Scoring**
   - Aspect ratio matching (standard card: 2.5:3.5)
   - Area validation
   - Vertex count (prefer 4 corners)
   - Confidence calculation (0-1 scale)

4. **Extraction**
   - Four-point perspective transform
   - Automatic rotation correction
   - Output straightened card image

## Configuration

Edit [.env](.env) file:

```bash
# Server Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Image Processing Settings
MAX_IMAGE_SIZE_MB=10
CROP_TIMEOUT_SECONDS=3
```

## Testing

### Manual Testing with Test Images

1. Place test images in `test_images/` directory
2. Use the interactive API docs at http://localhost:8000/docs
3. Upload an image and view the response

### Tips for Best Results

- Use good lighting (avoid shadows)
- Place card on contrasting background (white card on dark surface works well)
- Ensure entire card is visible in frame
- Card should be reasonably flat (not curved)
- Minimum card size: ~5% of image area

## Project Structure

```
backend/
├── app.py                 # FastAPI application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── .env.example          # Example environment variables
├── .env                  # Your environment variables (not committed)
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── utils/
    ├── __init__.py
    └── image_processor.py  # Card detection & cropping logic
```

## Deployment to Render

See [Render deployment guide](./RENDER_DEPLOYMENT.md) for instructions on deploying to Render.

## Troubleshooting

### "No card detected" errors

- Ensure card takes up at least 5% of image area
- Check that background contrasts with card
- Try adjusting lighting conditions
- Card should be reasonably rectangular (not too warped)

### Import errors

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Port already in use

```bash
# Change port in .env file
PORT=8001
```

## Next Steps (Phase 2)

- [ ] Google OAuth integration
- [ ] Google Photos upload functionality
- [ ] Batch processing support
- [ ] Enhanced error handling
- [ ] Rate limiting
- [ ] Caching

## License

Private project - All rights reserved

## Contact

Questions? Contact bhimanieshan@gmail.com
