from pydantic import BaseModel, EmailStr

from api.roles.user import Role


# ============================================================
# CREATE USER
# ============================================================

class UserCreate(BaseModel):

    full_name: str

    username: str

    email: EmailStr

    password: str

    role: Role


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(BaseModel):

    id: int

    username: str

    email: EmailStr

    full_name: str

    role: str

    phone: str | None = None

    website: str | None = None

    bio: str | None = None

    class Config:
        from_attributes = True


# ============================================================
# UPDATE PROFILE
# ============================================================

class UserUpdate(BaseModel):

    full_name: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    website: str | None = None

    bio: str | None = None


# ============================================================
# CHANGE PASSWORD
# ============================================================

class PasswordChange(BaseModel):

    current_password: str

    new_password: str