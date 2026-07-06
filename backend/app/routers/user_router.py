from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from services.user_service import (
    get_users,
    add_user,
    login_user
)

from schemas.user_schema import UserCreate
from auth.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def read_users():
    return get_users()


@router.post("/")
def create_user(user: UserCreate):
    return add_user(user)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    result = login_user(
        form_data.username,
        form_data.password
    )

    if "access_token" not in result:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return result


@router.get("/me")
def get_me(current_user: str = Depends(get_current_user)):
    return {
        "message": "Access granted",
        "username": current_user
    }