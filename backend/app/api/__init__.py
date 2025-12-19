# API package - exports routers

from fastapi import APIRouter

from .computers import router as computers_router
from .software import router as software_router
from .categories import router as categories_router, subcategory_router
from .subscriptions import router as subscriptions_router

router = APIRouter()
router.include_router(computers_router, tags=["Computers"])
router.include_router(software_router, tags=["Software"])
router.include_router(categories_router, tags=["Categories"])
router.include_router(subcategory_router, tags=["Subcategories"])
router.include_router(subscriptions_router, tags=["Subscriptions"])
