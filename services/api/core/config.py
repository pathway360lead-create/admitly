"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str

    # Meilisearch
    MEILISEARCH_HOST: str = "http://localhost:7700"
    MEILISEARCH_API_KEY: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # AI Services
    GEMINI_API_KEY: str = ""
    CLAUDE_API_KEY: str = ""

    # Paystack
    PAYSTACK_SECRET_KEY: str = ""
    PAYSTACK_PUBLIC_KEY: str = ""

    # Security
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]

    # Monitoring
    SENTRY_DSN: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
