"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # AI Services
    GOOGLE_AI_API_KEY: str
    GROQ_API_KEY: str
    OPENROUTER_API_KEY: str
    
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
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = 'ignore'


settings = Settings()
