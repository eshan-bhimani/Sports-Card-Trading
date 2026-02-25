# Google Cloud Storage Setup for CollectHub

This guide covers setting up GCS for automatic card image uploads.

## 1. Google Cloud Project Setup

```bash
# Install gcloud CLI if you don't have it: https://cloud.google.com/sdk/docs/install

# Create a project (or use an existing one)
gcloud projects create collecthub --name="CollectHub"
gcloud config set project collecthub

# Enable the Cloud Storage API
gcloud services enable storage.googleapis.com

# Enable billing (required for GCS)
# Go to: https://console.cloud.google.com/billing
```

## 2. Create a GCS Bucket

```bash
# Choose a globally unique bucket name
gcloud storage buckets create gs://collecthub-cards \
  --location=us-central1 \
  --default-storage-class=STANDARD \
  --uniform-bucket-level-access

# (Optional) Make the bucket publicly readable if you want public URLs to work:
gcloud storage buckets add-iam-policy-binding gs://collecthub-cards \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

## 3. Create a Service Account

```bash
# Create the service account
gcloud iam service-accounts create cc-card-uploader \
  --display-name="Card Uploader Service Account"

# Grant it write access to the bucket
gcloud storage buckets add-iam-policy-binding gs://collecthub-cards \
  --member="serviceAccount:cc-card-uploader@collecthub.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Download a key file (keep this secret!)
gcloud iam service-accounts keys create gcs-service-account-key.json \
  --iam-account=cc-card-uploader@collecthub.iam.gserviceaccount.com

# IMPORTANT: Move the key file to the backend/ directory
# It is already listed in .gitignore and will NOT be committed
mv gcs-service-account-key.json backend/
```

## 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the GCS section:

```bash
# In backend/.env
GCS_UPLOAD_ENABLED=true
GCS_BUCKET_NAME=collecthub-cards
GCS_CREDENTIALS_PATH=./gcs-service-account-key.json
GCS_DEFAULT_USER_ID=admin
GCS_SIGNED_URL_EXPIRATION_MINUTES=60
```

## 5. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## 6. Run the Server

```bash
python app.py
# Server starts at http://localhost:8000
# API docs at http://localhost:8000/docs
```

## 7. Smoke Tests

### Check upload status
```bash
curl http://localhost:8000/api/upload/status
# Expected: {"enabled":true,"connected":true,"bucket":"collecthub-cards"}
```

### Crop and upload in one call
```bash
curl -X POST "http://localhost:8000/api/crop-image?upload=true" \
  -F "file=@test_images/your_card.jpg"
```

### Direct upload of a pre-cropped image
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@cropped_card.png" \
  -F "user_id=admin" \
  -F "card_id=my-first-card"
```

### Python smoke test
```python
import requests

# Direct upload
with open("cropped_card.png", "rb") as f:
    resp = requests.post(
        "http://localhost:8000/api/upload",
        files={"file": ("card.png", f, "image/png")},
        data={"user_id": "admin"},
    )
    print(resp.json())
    # {
    #   "success": true,
    #   "blob_path": "admin/2025-01-15/abc123def_card.png",
    #   "bucket": "collecthub-cards",
    #   "public_url": "https://storage.googleapis.com/...",
    #   "signed_url": "https://storage.googleapis.com/...?X-Goog-Signature=...",
    #   "size_bytes": 123456,
    #   "uploaded_at": "2025-01-15T12:00:00+00:00",
    #   "card_id": "abc123def"
    # }
```

## Security Notes

### Token / Credential Storage

- **Service account key** (`gcs-service-account-key.json`) is the only secret file.
  It is listed in `.gitignore` and must NEVER be committed.
- In production (Render, Cloud Run, etc.), prefer **Workload Identity Federation**
  or the platform's built-in service account instead of a key file. Set
  `GCS_CREDENTIALS_PATH` to empty and the SDK will use Application Default
  Credentials (ADC) automatically.
- The `SECRET_KEY` in `.env` is for future JWT/session signing. Keep it secret.

### Evolving to Per-User OAuth

The current architecture uses a single service account ("admin mode"). To add
per-user Google auth later:

1. **Add OAuth login flow**: Use the existing `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   config to implement Google OAuth 2.0 login in the frontend.
2. **Store user tokens**: Save each user's OAuth refresh token (encrypted) in your
   database. Never store access tokens long-term.
3. **User-scoped uploads**: Pass the authenticated `user_id` to the upload endpoints.
   The GCS path is already structured as `{user_id}/{date}/{card_id}_{filename}`.
4. **Optional per-user buckets**: For premium users, you could create per-user
   prefixes with IAM conditions, or use signed URLs scoped to their prefix.
5. **The GCSUploader class is already designed for this**: just pass a different
   `user_id` per request. No structural changes needed.

## GCS Bucket Organization

```
collecthub-cards/
├── admin/                    # Admin/default uploads
│   ├── 2025-01-15/
│   │   ├── abc123_card.png
│   │   └── def456_photo.png
│   └── 2025-01-16/
│       └── ...
├── user_42/                  # Future: per-user folders
│   └── 2025-01-15/
│       └── ...
└── user_99/
    └── ...
```

## Quotas and Limits

- **GCS free tier**: 5 GB storage, 1 GB egress/month (us regions)
- **No per-user upload quota** (unlike Google Photos API's 75/day)
- **Object size limit**: 5 TB per object (not a concern for card images)
- **Request rate**: 5,000 writes/sec per bucket (more than enough)
- **Signed URL expiration**: Configurable via `GCS_SIGNED_URL_EXPIRATION_MINUTES`

## Running Tests

```bash
cd backend
pip install pytest httpx
python -m pytest tests/ -v
```

All 23 tests run without GCS credentials (everything is mocked).
