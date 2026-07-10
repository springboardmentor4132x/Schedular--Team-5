
from api.core import constants
from api.database.init_db import init_db
from contextlib import asynccontextmanager
from fastapi import FastAPI
from typing import Dict

@asynccontextmanager
async def lifespan(
    app: FastAPI
):
    init_db()
    yield

app = FastAPI(
    title=constants.PROJECT_TITLE,
    description=constants.PROJECT_DESCRIPTION,
    version=constants.PROJECT_VERSION,
    lifespan=lifespan
)

@app.get('/', response_model=None, tags=["Root Route"])
def read_root() -> Dict:
    return {"message": "Welcome to Social Pilot Backend"}

@app.get('/health', response_model=None, tags=["Health Check Route"])
def health_check() -> Dict:
    return {"status": "healthy", "version": constants.PROJECT_VERSION}
