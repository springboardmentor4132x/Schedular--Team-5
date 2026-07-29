<<<<<<< HEAD
import os

=======
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)
from contextlib import asynccontextmanager
from typing import Dict

from fastapi import FastAPI
<<<<<<< HEAD
from fastapi.middleware.cors import CORSMiddleware
=======
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)
from fastapi.staticfiles import StaticFiles

from api.core import constants
from api.database.init_db import init_db
from api.business_assignment import router as business_assignment_router
from api.routers.user import router as user_router
from api.routers.social_account import router as social_account_router
from api.routers.twitter import router as twitter_router
from api.routers.post import router as post_router
from api.routers.campaign import router as campaign_router
from api.routers.upload import router as upload_router
from api.routers import youtube

<<<<<<< HEAD

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)
=======
from api.routers.user import router as user_router
from api.routers.social_account import router as social_account_router
from api.routers.twitter import router as twitter_router
from api.routers.pinterest import router as pinterest_router
from api.routers.post import router as post_router
from api.routers.campaign import router as campaign_router
from api.routers.upload import router as upload_router
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=constants.PROJECT_TITLE,
    description=constants.PROJECT_DESCRIPTION,
    version=constants.PROJECT_VERSION,
    lifespan=lifespan,
)

<<<<<<< HEAD

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
=======
app.include_router(user_router)
app.include_router(social_account_router)
app.include_router(twitter_router)
app.include_router(pinterest_router)
app.include_router(post_router)
app.include_router(campaign_router)
app.include_router(upload_router)

app.mount("/uploads", StaticFiles(directory="api/uploads"), name="uploads")
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)


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


app.include_router(
    router=youtube.router
)

app.include_router(user_router)
app.include_router(social_account_router)
app.include_router(twitter_router)
app.include_router(post_router)
app.include_router(campaign_router)
app.include_router(upload_router)
app.include_router(business_assignment_router)


app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)