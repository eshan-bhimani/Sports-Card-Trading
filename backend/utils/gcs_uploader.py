"""
Google Cloud Storage uploader for processed baseball card images.

Uploads cropped/oriented card images to a GCS bucket with structured paths.
Designed for admin/service-account mode now, with a clear path to per-user
OAuth in the future.

Usage:
    uploader = GCSUploader(bucket_name="my-bucket")
    result = uploader.upload_image(image_bytes, filename="card.png", user_id="admin")
"""

import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError

logger = logging.getLogger(__name__)


class GCSUploadError(Exception):
    """Raised when a GCS upload fails."""


class GCSUploader:
    """Handles uploading processed card images to Google Cloud Storage."""

    def __init__(
        self,
        bucket_name: str,
        credentials_path: Optional[str] = None,
        default_user_id: str = "admin",
        signed_url_expiration_minutes: int = 60,
    ):
        """
        Args:
            bucket_name: GCS bucket name.
            credentials_path: Path to service account JSON key file.
                If None, uses Application Default Credentials (ADC).
            default_user_id: Default user folder when no user_id is provided.
            signed_url_expiration_minutes: How long signed URLs remain valid.
        """
        self.bucket_name = bucket_name
        self.default_user_id = default_user_id
        self.signed_url_expiration_minutes = signed_url_expiration_minutes

        try:
            if credentials_path:
                self._client = storage.Client.from_service_account_json(credentials_path)
            else:
                self._client = storage.Client()
            self._bucket = self._client.bucket(bucket_name)
            logger.info(f"GCS uploader initialized for bucket '{bucket_name}'")
        except Exception as e:
            logger.error(f"Failed to initialize GCS client: {e}")
            raise GCSUploadError(f"Could not initialize GCS client: {e}") from e

    def _build_blob_path(
        self,
        filename: str,
        user_id: Optional[str] = None,
        card_id: Optional[str] = None,
    ) -> str:
        """Build a structured blob path: user_id/YYYY-MM-DD/card_id_filename."""
        user = user_id or self.default_user_id
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        unique_id = card_id or uuid.uuid4().hex[:12]
        blob_name = f"{user}/{date_str}/{unique_id}_{filename}"
        return blob_name

    def upload_image(
        self,
        image_bytes: bytes,
        filename: str = "card.png",
        content_type: str = "image/png",
        user_id: Optional[str] = None,
        card_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Upload processed image bytes to GCS.

        Args:
            image_bytes: Raw PNG/JPEG bytes of the cropped card.
            filename: Filename for the object (e.g. "card.png").
            content_type: MIME type of the image.
            user_id: User folder for organized storage.
            card_id: Optional card identifier; auto-generated if omitted.
            metadata: Optional dict of custom metadata to attach to the blob.

        Returns:
            dict with upload details:
                - blob_path: full object path in the bucket
                - bucket: bucket name
                - public_url: public URL (if bucket is public)
                - signed_url: time-limited signed URL for private buckets
                - size_bytes: uploaded file size
                - uploaded_at: ISO timestamp
                - card_id: the card identifier used

        Raises:
            GCSUploadError: If the upload fails.
        """
        blob_path = self._build_blob_path(filename, user_id=user_id, card_id=card_id)
        card_id_used = blob_path.split("/")[-1].split("_")[0]

        logger.info(f"Uploading {len(image_bytes)} bytes to gs://{self.bucket_name}/{blob_path}")

        try:
            blob = self._bucket.blob(blob_path)
            blob.content_type = content_type

            if metadata:
                blob.metadata = metadata

            blob.upload_from_string(image_bytes, content_type=content_type)

            # Generate signed URL for private access
            signed_url = self._generate_signed_url(blob)

            # Public URL (works only if bucket/object is publicly readable)
            public_url = f"https://storage.googleapis.com/{self.bucket_name}/{blob_path}"

            upload_time = datetime.now(timezone.utc).isoformat()

            result = {
                "blob_path": blob_path,
                "bucket": self.bucket_name,
                "public_url": public_url,
                "signed_url": signed_url,
                "size_bytes": len(image_bytes),
                "uploaded_at": upload_time,
                "card_id": card_id_used,
            }

            logger.info(f"Upload successful: {blob_path} ({len(image_bytes)} bytes)")
            return result

        except GoogleCloudError as e:
            logger.error(f"GCS upload failed for {blob_path}: {e}")
            raise GCSUploadError(f"Upload failed: {e}") from e
        except Exception as e:
            logger.error(f"Unexpected error during upload of {blob_path}: {e}")
            raise GCSUploadError(f"Unexpected upload error: {e}") from e

    def _generate_signed_url(self, blob: storage.Blob) -> Optional[str]:
        """Generate a time-limited signed URL for the blob."""
        try:
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(minutes=self.signed_url_expiration_minutes),
                method="GET",
            )
            return url
        except Exception as e:
            # Signed URL generation can fail if using ADC without a service account
            # key file. This is non-fatal -- the public URL still works if the
            # bucket is public, and callers can handle a None signed_url.
            logger.warning(f"Could not generate signed URL (expected with ADC): {e}")
            return None

    def delete_image(self, blob_path: str) -> bool:
        """Delete an image from GCS. Returns True if deleted, False if not found."""
        try:
            blob = self._bucket.blob(blob_path)
            blob.delete()
            logger.info(f"Deleted {blob_path}")
            return True
        except GoogleCloudError as e:
            logger.warning(f"Failed to delete {blob_path}: {e}")
            return False

    def check_connection(self) -> bool:
        """Verify that the GCS bucket is accessible."""
        try:
            self._bucket.reload()
            return True
        except Exception as e:
            logger.error(f"GCS connection check failed: {e}")
            return False
