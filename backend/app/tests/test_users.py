from services.user_service import (
    add_user,
    get_users
)

from schemas.user_schema import UserCreate


def test_create_user():

    user = UserCreate(
        username="testuser",
        email="test@example.com",
        password="Password123",
        role="creator"
    )

    add_user(user)

    users = get_users()

    assert len(users) > 0