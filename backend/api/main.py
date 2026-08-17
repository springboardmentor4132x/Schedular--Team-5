from api.routers.user import router as user_router
from api.routers.social_account import router as social_account_router
from api.routers.twitter import router as twitter_router
from api.routers import linkedin
from api.routers import schedule

from api.routers.x import router as x_router
from api.routers.pinterest import router as pinterest_router

from api.core import constants
from api.database.init_db import init_db
from api.routers import youtube
from api.routers import analytics
from api.routers.notifications import router as notifications_router
from api.routers.reports import router as reports_router

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=constants.PROJECT_TITLE,
    description=constants.PROJECT_DESCRIPTION,
    version=constants.PROJECT_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=None, tags=["Root Route"])
def read_root() -> Dict:
    return {
        "message": "Welcome to Social Pilot Backend"
    }


@app.get("/health", response_model=None, tags=["Health Check Route"])
def health_check() -> Dict:
    return {
        "status": "healthy",
        "version": constants.PROJECT_VERSION
    }

app.include_router(user_router)
app.include_router(social_account_router)
app.include_router(twitter_router)
app.include_router(youtube.router)
app.include_router(linkedin.router)
app.include_router(schedule.router)
app.include_router(analytics.router)
app.include_router(notifications_router)
app.include_router(reports_router)
app.include_router(x_router)
app.include_router(pinterest_router)
