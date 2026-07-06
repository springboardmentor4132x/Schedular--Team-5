from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.user_service import (
    get_users,
    add_user,
    login_user
)

from schemas.user_schema import UserCreate

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.get("/")
def read_users():
    return get_users()


@router.post("/")
def create_user(user: UserCreate):
    return add_user(user)


@router.post("/login")
def login(user: LoginRequest):
    result = login_user(user.username, user.password)

    if "access_token" not in result:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return result