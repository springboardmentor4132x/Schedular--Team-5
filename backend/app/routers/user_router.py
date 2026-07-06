from fastapi import APIRouter
from services.user_service import get_users, add_user
from schemas.user_schema import UserCreate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def read_users():
    return get_users()

@router.post("/")
def create_user(user: UserCreate):
    return add_user(user)