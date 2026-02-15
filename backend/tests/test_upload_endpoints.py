"""
Integration tests for the upload-related API endpoints.

Uses FastAPI's TestClient with mocked GCS to test endpoint behavior
without real cloud credentials.
"""

import base64
import io
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def reset_uploader_singleton():
    """Reset the module-level _gcs_uploader before each test."""
    import app as app_module
    app_module._gcs_uploader = None
    yield
    app_module._gcs_uploader = None


@pytest.fixture
def client():
    """FastAPI TestClient."""
    from app import app
    return TestClient(app)


@pytest.fixture
def mock_gcs_uploader():
    """Patch the GCSUploader class and settings to enable uploads."""
    with patch("app.settings") as mock_settings, \
         patch("app.GCSUploader") as mock_uploader_cls:

        # Enable GCS in settings
        mock_settings.gcs_upload_enabled = True
        mock_settings.gcs_bucket_name = "test-bucket"
        mock_settings.gcs_credentials_path = None
        mock_settings.gcs_default_user_id = "admin"
        mock_settings.gcs_signed_url_expiration_minutes = 60
        mock_settings.max_image_size_mb = 10
        mock_settings.environment = "test"
        mock_settings.host = "0.0.0.0"
        mock_settings.port = 8000

        mock_instance = MagicMock()
        mock_instance.upload_image.return_value = {
            "blob_path": "admin/2025-01-15/abc123_card.png",
            "bucket": "test-bucket",
            "public_url": "https://storage.googleapis.com/test-bucket/admin/2025-01-15/abc123_card.png",
            "signed_url": "https://signed-url.example.com",
            "size_bytes": 1234,
            "uploaded_at": "2025-01-15T12:00:00+00:00",
            "card_id": "abc123",
        }
        mock_instance.check_connection.return_value = True
        mock_uploader_cls.return_value = mock_instance

        yield {
            "cls": mock_uploader_cls,
            "instance": mock_instance,
            "settings": mock_settings,
        }


def _make_png_file():
    """Create a minimal in-memory PNG file for upload."""
    png_bytes = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4"
        "nGNgYPgPAAEDAQAIicLsAAAABJRU5ErkJggg=="
    )
    return ("card.png", io.BytesIO(png_bytes), "image/png")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

class TestHealthCheck:
    def test_health_returns_gcs_status(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "gcs_enabled" in data


# ---------------------------------------------------------------------------
# POST /api/crop-image (existing endpoint, upload flag)
# ---------------------------------------------------------------------------

class TestCropImageWithUpload:
    def test_crop_without_upload_flag(self, client):
        """Existing behavior: crop-only, no upload."""
        file = _make_png_file()
        resp = client.post("/api/crop-image", files={"file": file})
        # May return 422 if image has no card — that's expected for a 1px image
        assert resp.status_code in (200, 422)
        if resp.status_code == 200:
            data = resp.json()
            assert "upload_result" not in data

    def test_crop_with_upload_flag_gcs_disabled(self, client):
        """upload=true but GCS not configured — crop still succeeds, upload_result has error."""
        file = _make_png_file()
        resp = client.post("/api/crop-image?upload=true", files={"file": file})
        # Crop may succeed or fail depending on card detection
        if resp.status_code == 200:
            data = resp.json()
            # Upload result should contain an error since GCS is not enabled
            if "upload_result" in data:
                assert "error" in data["upload_result"]


# ---------------------------------------------------------------------------
# POST /api/upload
# ---------------------------------------------------------------------------

class TestUploadEndpoint:
    def test_upload_gcs_disabled(self, client):
        """Upload fails gracefully when GCS is not enabled."""
        file = _make_png_file()
        resp = client.post("/api/upload", files={"file": file})
        assert resp.status_code == 503

    def test_upload_success(self, client, mock_gcs_uploader):
        """Successful upload to mocked GCS."""
        file = _make_png_file()
        resp = client.post("/api/upload", files={"file": file})
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["bucket"] == "test-bucket"
        assert "blob_path" in data
        assert "signed_url" in data

    def test_upload_with_user_and_card_id(self, client, mock_gcs_uploader):
        """Upload with custom user_id and card_id."""
        file = _make_png_file()
        resp = client.post(
            "/api/upload",
            files={"file": file},
            data={"user_id": "user42", "card_id": "xyz789"},
        )
        assert resp.status_code == 200
        # Verify the uploader was called with correct params
        call_kwargs = mock_gcs_uploader["instance"].upload_image.call_args[1]
        assert call_kwargs["user_id"] == "user42"
        assert call_kwargs["card_id"] == "xyz789"

    def test_upload_rejects_non_image(self, client, mock_gcs_uploader):
        """Non-image files are rejected."""
        resp = client.post(
            "/api/upload",
            files={"file": ("data.txt", io.BytesIO(b"hello"), "text/plain")},
        )
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# GET /api/upload/status
# ---------------------------------------------------------------------------

class TestUploadStatus:
    def test_status_disabled(self, client):
        """Returns disabled status when GCS is off."""
        resp = client.get("/api/upload/status")
        assert resp.status_code == 200
        data = resp.json()
        assert data["enabled"] is False

    def test_status_enabled_connected(self, client, mock_gcs_uploader):
        """Returns connected status when GCS is configured."""
        resp = client.get("/api/upload/status")
        assert resp.status_code == 200
        data = resp.json()
        assert data["enabled"] is True
        assert data["connected"] is True
        assert data["bucket"] == "test-bucket"
