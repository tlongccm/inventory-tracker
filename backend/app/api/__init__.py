# API package - exports routers

from fastapi import APIRouter

from .computers import router as computers_router
from .software import router as software_router

router = APIRouter()
router.include_router(computers_router, tags=["Computers"])
router.include_router(software_router, tags=["Software"])
