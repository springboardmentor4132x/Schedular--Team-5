from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from api.services.user import get_users, add_user, login_user, update_profile, change_password
from api.schemas.user import UserCreate, UserResponse, UserUpdate, PasswordChange
from api.auth.auth import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserResponse])
def read_users():
    return get_users()


@router.post("/")
def create_user(user: UserCreate):
    return add_user(user)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return login_user(form_data.username, form_data.password)


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {"message": "Access granted", "username": current_user["username"], "role": current_user["role"]}


@router.get("/admin")
def admin_route(current_user=Depends(require_role("administrator"))):
    return {"message": "Welcome Admin", "user": current_user}


@router.put("/me")
def update_my_profile(updates: UserUpdate, current_user=Depends(get_current_user)):
    return update_profile(current_user["username"], updates)


@router.put("/me/password")
def update_my_password(payload: PasswordChange, current_user=Depends(get_current_user)):
    return change_password(current_user["username"], payload.current_password, payload.new_password)

