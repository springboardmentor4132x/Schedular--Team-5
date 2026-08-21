from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from api.services.user import (
    get_users,
    add_user,
    login_user,
    get_profile,
    update_profile,
    change_password,
    delete_user,
)

from api.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    PasswordChange,
)

from api.auth.auth import (
    get_current_user,
    require_role,
)

from api.database.session import SessionLocal
from api.models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================
# GET USERS
# ============================================================

@router.get(
    "/",
    response_model=list[UserResponse]
)
def read_users():
    return get_users()


# ============================================================
# CHECK ADMINISTRATOR
# ============================================================

@router.get("/admin-exists")
def check_administrator_exists():
    db = SessionLocal()

    try:
        administrator_exists = db.query(User).filter(
            User.role == "administrator"
        ).first() is not None

        return {
            "administrator_exists": administrator_exists
        }

    finally:
        db.close()


# ============================================================
# CREATE USER
# ============================================================

@router.post("/")
def create_user(user: UserCreate):
    return add_user(user)


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    return login_user(
        form_data.username,
        form_data.password
    )


# ============================================================
# GET CURRENT USER PROFILE
# ============================================================

@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    profile = get_profile(
        current_user["username"]
    )

    return {
        "message": "Access granted",

        "id": profile["id"],

        "username": profile["username"],

        "role": profile["role"],

        "email": profile["email"],

        "full_name": profile["full_name"],

        "phone": profile["phone"],

        "website": profile["website"],

        "bio": profile["bio"],
    }


# ============================================================
# UPDATE CURRENT USER PROFILE
# ============================================================

@router.put("/me")
def update_my_profile(
    updates: UserUpdate,
    current_user=Depends(get_current_user)
):
    return update_profile(
        current_user["username"],
        updates
    )


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put("/me/password")
def update_my_password(
    payload: PasswordChange,
    current_user=Depends(get_current_user)
):
    return change_password(
        current_user["username"],
        payload.current_password,
        payload.new_password
    )


# ============================================================
# GET ALL USERS
# ============================================================

@router.get(
    "/all",
    response_model=list[UserResponse]
)
def list_all_users(
    current_user=Depends(
        require_role(
            "administrator",
            "marketing_team"
        )
    )
):
    return get_users()


# ============================================================
# DELETE USER
# ============================================================

@router.delete("/{user_id}")
def delete_user_account(
    user_id: int,
    current_user=Depends(
        require_role("administrator")
    )
):
    return delete_user(user_id)


# ============================================================
# ADMIN ROUTE
# ============================================================

@router.get("/admin")
def admin_route(
    current_user=Depends(
        require_role("administrator")
    )
):
    return {
        "message": "Welcome Admin",
        "user": current_user
    }


# ============================================================
# MARKETING ROUTE
# ============================================================

@router.get("/marketing")
def marketing_route(
    current_user=Depends(
        require_role(
            "marketing_team",
            "administrator"
        )
    )
):
    return {
        "message": "Welcome Marketing Team",
        "user": current_user
    }


# ============================================================
# BUSINESS ROUTE
# ============================================================

@router.get("/business")
def business_route(
    current_user=Depends(
        require_role(
            "business_user",
            "administrator"
        )
    )
):
    return {
        "message": "Welcome Business User",
        "user": current_user
    }


# ============================================================
# CREATOR ROUTE
# ============================================================

@router.get("/creator")
def creator_route(
    current_user=Depends(
        require_role(
            "content_creator",
            "administrator"
        )
    )
):
    return {
        "message": "Welcome Content Creator",
        "user": current_user
    }