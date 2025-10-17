"""
SCAP Backend - FastAPI Application Entry Point
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import suppliers, documents, compliance, risk, chat
from api.middleware.error_handler import add_error_handlers
from database.mongodb import connect_db, close_db
from utils.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await connect_db()
    print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    print(f"✅ SCAP Backend running on http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"📚 API Documentation: http://localhost:{settings.API_PORT}/docs")
    
    yield
    
    # Shutdown
    await close_db()
    print("👋 Disconnected from MongoDB")


app = FastAPI(
    title="SCAP API",
    description="Supply Chain AI Compliance Platform - Automate textile compliance management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handlers
add_error_handlers(app)

# Include routers
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SCAP Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "environment": settings.ENVIRONMENT
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
