from models.user import User
from auth.auth import (
    hash_password,
    verify_password,
    create_access_token
)

users = []


def get_users():
    return users


def add_user(user):
    new_user = User(
        id=len(users) + 1,
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    users.append(new_user)

    return {
        "message": "User created successfully"
    }


def login_user(username: str, password: str):

    for user in users:

        if user.username == username:

            if verify_password(password, user.password):

                token = create_access_token(
                    {
                        "sub": user.username,
                        "role": user.role
                    }
                )

                return {
                    "access_token": token,
                    "token_type": "bearer"
                }

    return {
        "error": "Invalid username or password"
    }