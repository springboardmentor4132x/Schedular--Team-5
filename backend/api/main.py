import os
from contextlib import asynccontextmanager
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.core import constants
from api.database.init_db import init_db

from api.business_assignment import router as business_assignment_router
from api.routers.user import router as user_router
from api.routers.social_account import router as social_account_router
from api.routers.twitter import router as twitter_router
from api.routers.pinterest import router as pinterest_router
from api.routers.post import router as post_router
from api.routers.campaign import router as campaign_router
from api.routers.upload import router as upload_router
from api.routers.client import router as client_router
from api.routers.notification import router as notification_router

from api.routers import youtube
from api.routers import linkedin
from api.routers import schedule


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=constants.PROJECT_TITLE,
    description=constants.PROJECT_DESCRIPTION,
    version=constants.PROJECT_VERSION,
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT ROUTES
# ============================================================

@app.get(
    "/",
    response_model=None,
    tags=["Root Route"],
)
def read_root() -> Dict:
    return {
        "message": "Welcome to Social Pilot Backend"
    }


@app.get(
    "/health",
    response_model=None,
    tags=["Health Check Route"],
)
def health_check() -> Dict:
    return {
        "status": "healthy",
        "version": constants.PROJECT_VERSION,
    }


# ============================================================
# ROUTERS
# ============================================================

app.include_router(youtube.router)
app.include_router(linkedin.router)

app.include_router(user_router)
app.include_router(social_account_router)
app.include_router(twitter_router)
app.include_router(pinterest_router)

app.include_router(post_router)
app.include_router(campaign_router)
app.include_router(upload_router)
app.include_router(client_router)
app.include_router(business_assignment_router)

app.include_router(notification_router)

app.include_router(schedule.router)