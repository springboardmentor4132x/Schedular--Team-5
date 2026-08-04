from pydantic import BaseModel, EmailStr
from api.roles.user import Role


class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    role: Role


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str