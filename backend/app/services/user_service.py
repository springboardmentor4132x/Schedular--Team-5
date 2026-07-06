from models.user import User
from auth.auth import hash_password, verify_password, create_access_token

users = []

def get_users():
    return users

def add_user(user):
    user.password = hash_password(user.password)
    users.append(user)
    return {
        "message": "User registered successfully"
    }

def login_user(username: str, password: str):
    for user in users:
        if user.username == username:
            if verify_password(password, user.password):
                token = create_access_token({"sub": username})
                return {
                    "access_token": token,
                    "token_type": "bearer"
                }

    return {
        "message": "Invalid username or password"
    }