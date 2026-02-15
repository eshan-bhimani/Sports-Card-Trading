"""
Unit tests for the GCS uploader module.

These tests mock the google.cloud.storage client so they run without
any real GCS credentials or network access.
"""

import base64
from datetime import datetime
from unittest.mock import MagicMock, patch, PropertyMock

import pytest

from utils.gcs_uploader import GCSUploader, GCSUploadError


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_storage_client():
    """Patch google.cloud.storage.Client and return the mock."""
    with patch("utils.gcs_uploader.storage.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_bucket = MagicMock()
        mock_client_cls.return_value = mock_client
        mock_client_cls.from_service_account_json.return_value = mock_client
        mock_client.bucket.return_value = mock_bucket
        yield {
            "client_cls": mock_client_cls,
            "client": mock_client,
            "bucket": mock_bucket,
        }


@pytest.fixture
def uploader(mock_storage_client):
    """Create a GCSUploader with mocked storage."""
    return GCSUploader(
        bucket_name="test-bucket",
        default_user_id="test-user",
        signed_url_expiration_minutes=30,
    )


@pytest.fixture
def uploader_with_creds(mock_storage_client):
    """Create a GCSUploader using a credentials path."""
    return GCSUploader(
        bucket_name="test-bucket",
        credentials_path="/fake/path/key.json",
        default_user_id="admin",
    )


@pytest.fixture
def sample_image_bytes():
    """Minimal PNG bytes for testing (1x1 transparent pixel)."""
    # Smallest valid PNG: 1x1 pixel, RGBA, transparent
    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4"
        "nGNgYPgPAAEDAQAIicLsAAAABJRU5ErkJggg=="
    )


# ---------------------------------------------------------------------------
# Initialization tests
# ---------------------------------------------------------------------------

class TestGCSUploaderInit:
    def test_init_with_adc(self, mock_storage_client):
        """Default credentials (ADC) path."""
        uploader = GCSUploader(bucket_name="my-bucket")
        mock_storage_client["client_cls"].assert_called_once()
        mock_storage_client["client"].bucket.assert_called_once_with("my-bucket")

    def test_init_with_service_account(self, mock_storage_client):
        """Explicit service account key file."""
        uploader = GCSUploader(bucket_name="my-bucket", credentials_path="/key.json")
        mock_storage_client["client_cls"].from_service_account_json.assert_called_once_with("/key.json")

    def test_init_failure_raises(self, mock_storage_client):
        """Client init failure raises GCSUploadError."""
        mock_storage_client["client_cls"].side_effect = Exception("bad creds")
        with pytest.raises(GCSUploadError, match="Could not initialize GCS client"):
            GCSUploader(bucket_name="fail-bucket")


# ---------------------------------------------------------------------------
# Blob path construction
# ---------------------------------------------------------------------------

class TestBuildBlobPath:
    def test_default_user(self, uploader):
        path = uploader._build_blob_path("card.png")
        parts = path.split("/")
        assert parts[0] == "test-user"  # default_user_id
        # Date folder: YYYY-MM-DD
        assert len(parts[1].split("-")) == 3
        # Filename contains a UUID prefix
        assert parts[2].endswith("_card.png")

    def test_custom_user_and_card_id(self, uploader):
        path = uploader._build_blob_path("photo.jpg", user_id="user42", card_id="abc123")
        assert path.startswith("user42/")
        assert "abc123_photo.jpg" in path

    def test_date_folder_format(self, uploader):
        path = uploader._build_blob_path("x.png")
        date_str = path.split("/")[1]
        # Should parse as a valid date
        datetime.strptime(date_str, "%Y-%m-%d")


# ---------------------------------------------------------------------------
# Upload tests
# ---------------------------------------------------------------------------

class TestUploadImage:
    def test_successful_upload(self, uploader, mock_storage_client, sample_image_bytes):
        mock_blob = MagicMock()
        mock_blob.generate_signed_url.return_value = "https://signed-url.example.com"
        mock_storage_client["bucket"].blob.return_value = mock_blob

        result = uploader.upload_image(
            image_bytes=sample_image_bytes,
            filename="card.png",
            content_type="image/png",
            user_id="u1",
            card_id="c1",
        )

        # Verify blob was uploaded
        mock_blob.upload_from_string.assert_called_once_with(sample_image_bytes, content_type="image/png")
        assert result["bucket"] == "test-bucket"
        assert result["blob_path"].startswith("u1/")
        assert "c1_card.png" in result["blob_path"]
        assert result["size_bytes"] == len(sample_image_bytes)
        assert result["signed_url"] == "https://signed-url.example.com"
        assert "uploaded_at" in result
        assert result["card_id"] == "c1"

    def test_upload_with_metadata(self, uploader, mock_storage_client, sample_image_bytes):
        mock_blob = MagicMock()
        mock_blob.generate_signed_url.return_value = "https://url"
        mock_storage_client["bucket"].blob.return_value = mock_blob

        uploader.upload_image(
            image_bytes=sample_image_bytes,
            metadata={"confidence": "0.95"},
        )

        assert mock_blob.metadata == {"confidence": "0.95"}

    def test_upload_failure_raises(self, uploader, mock_storage_client, sample_image_bytes):
        from google.cloud.exceptions import GoogleCloudError

        mock_blob = MagicMock()
        mock_blob.upload_from_string.side_effect = GoogleCloudError("quota exceeded")
        mock_storage_client["bucket"].blob.return_value = mock_blob

        with pytest.raises(GCSUploadError, match="Upload failed"):
            uploader.upload_image(image_bytes=sample_image_bytes)

    def test_signed_url_failure_is_nonfatal(self, uploader, mock_storage_client, sample_image_bytes):
        mock_blob = MagicMock()
        mock_blob.generate_signed_url.side_effect = Exception("no key for signing")
        mock_storage_client["bucket"].blob.return_value = mock_blob

        result = uploader.upload_image(image_bytes=sample_image_bytes)

        # Upload should succeed, signed_url should be None
        assert result["signed_url"] is None
        assert result["public_url"].startswith("https://storage.googleapis.com/")


# ---------------------------------------------------------------------------
# Delete tests
# ---------------------------------------------------------------------------

class TestDeleteImage:
    def test_successful_delete(self, uploader, mock_storage_client):
        mock_blob = MagicMock()
        mock_storage_client["bucket"].blob.return_value = mock_blob

        assert uploader.delete_image("user/2025-01-01/abc_card.png") is True
        mock_blob.delete.assert_called_once()

    def test_delete_failure_returns_false(self, uploader, mock_storage_client):
        from google.cloud.exceptions import GoogleCloudError

        mock_blob = MagicMock()
        mock_blob.delete.side_effect = GoogleCloudError("not found")
        mock_storage_client["bucket"].blob.return_value = mock_blob

        assert uploader.delete_image("nonexistent/path.png") is False


# ---------------------------------------------------------------------------
# Connection check
# ---------------------------------------------------------------------------

class TestCheckConnection:
    def test_connection_ok(self, uploader, mock_storage_client):
        assert uploader.check_connection() is True
        mock_storage_client["bucket"].reload.assert_called_once()

    def test_connection_fail(self, uploader, mock_storage_client):
        mock_storage_client["bucket"].reload.side_effect = Exception("network error")
        assert uploader.check_connection() is False
