"""FastAPI application entry point with CORS middleware and API router mounting."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_tables
from .api import router as api_router

# Create FastAPI application
app = FastAPI(
    title="Equipment Inventory Tracker API",
    description="REST API for managing equipment inventory records",
    version="1.0.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Vite dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    create_tables()


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Equipment Inventory Tracker API"}
