from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "creator"


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str