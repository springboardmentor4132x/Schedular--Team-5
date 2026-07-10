from auth.auth import (
    hash_password,
    verify_password
)


def test_password_hashing():
    password = "Pravin@2004"

    hashed = hash_password(password)

    assert hashed != password

    assert verify_password(password, hashed)