"""
FastAPI Backend for Admitly Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from core.config import settings
from core.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    logger.info("Starting Admitly API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    yield
    logger.info("Shutting down Admitly API...")


# Create FastAPI app
app = FastAPI(
    title="Admitly API",
    description="Nigeria Student Data Services Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Admitly API",
        "docs": "/docs",
        "health": "/health",
    }


# Register routers
from routers.auth import router as auth_router
from routers.institutions import router as institutions_router
from routers.programs import router as programs_router
from routers.search import router as search_router
from routers.bookmarks import router as bookmarks_router
from routers.saved_searches import router as saved_searches_router
from routers.user_profile import router as user_profile_router
from routers.search_history import router as search_history_router
from routers.notifications import router as notifications_router

app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
app.include_router(institutions_router, prefix="/api/v1")
app.include_router(programs_router, prefix="/api/v1")
app.include_router(search_router)
app.include_router(bookmarks_router, prefix="/api/v1")
app.include_router(saved_searches_router, prefix="/api/v1")
app.include_router(user_profile_router, prefix="/api/v1")
app.include_router(search_history_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
    )
