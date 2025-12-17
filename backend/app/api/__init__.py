# API package - exports routers

from fastapi import APIRouter

from .computers import router as computers_router

router = APIRouter()
router.include_router(computers_router, tags=["Computers"])
