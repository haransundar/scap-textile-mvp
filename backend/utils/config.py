"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # AI Services
    GOOGLE_AI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    
    # Database
    MONGODB_URI: str = "mongodb://localhost:27017/scap_local"
    MONGODB_DB_NAME: str = "scap_local"
    
    # ChromaDB
    CHROMA_PERSIST_DIR: str = "../data/embeddings"
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Storage Configuration
    STORAGE_TYPE: str = "local"  # 's3' or 'local'
    
    # S3 Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "scap-documents"
    
    # Local Storage Configuration
    LOCAL_STORAGE_PATH: str = "data/uploads"
    BASE_URL: str = "http://localhost:8000"
    
    # File Upload Settings
    MAX_FILE_SIZE_MB: int = 10  # 10MB max file size
    ALLOWED_FILE_TYPES: list = ["application/pdf", "image/jpeg", "image/png"]
    
    class Config:
        env_file = "../.env"  # Look for .env in parent directory (project root)
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = 'ignore'


settings = Settings()
