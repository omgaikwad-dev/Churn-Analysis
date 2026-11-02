import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
import app.models  # Ensure all SQLAlchemy models are registered
from app.api.v1.router import api_router
from app.ml.reference_data import get_or_create_reference_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("churnguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and reference dataset exist
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Verifying reference dataset...")
    get_or_create_reference_dataset()
    logger.info("ChurnGuard AI platform is ready.")
    yield
    # Shutdown
    logger.info("Shutting down ChurnGuard AI platform...")

app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description="Customer Churn Analysis, Prediction, and ML Monitoring Platform",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount versioned API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def healthcheck():
    """Platform healthcheck returning operational status."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "2.0.0",
    }

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "ChurnGuard AI Platform API Running",
        "docs_url": "/docs",
        "health_url": "/health",
    }
