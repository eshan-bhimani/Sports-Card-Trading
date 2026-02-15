from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server Configuration
    port: int = 8000
    host: str = "0.0.0.0"
    environment: str = "development"

    # Google OAuth Configuration (for future per-user auth)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    # Google Cloud Storage Configuration
    gcs_bucket_name: Optional[str] = None
    gcs_credentials_path: Optional[str] = None  # Path to service account JSON key
    gcs_default_user_id: str = "admin"
    gcs_signed_url_expiration_minutes: int = 60
    gcs_upload_enabled: bool = False  # Master toggle for GCS uploads

    # Image Processing Settings
    max_image_size_mb: int = 10
    crop_timeout_seconds: int = 3

    # Security
    secret_key: str = "dev-secret-key-change-in-production"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
