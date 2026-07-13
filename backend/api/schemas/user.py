from pydantic import BaseModel, EmailStr
from api.roles.user import Role

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: Role = Role.CONTENT_CREATOR

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: Role

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
