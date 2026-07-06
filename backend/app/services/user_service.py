from models.user import User

users = []

def get_users():
    return users

def add_user(user):
    users.append(user)
    return user