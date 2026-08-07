from sqlalchemy.exc import IntegrityError

from api.database.session import SessionLocal
from api.models.user import User

from api.auth.auth import (
    hash_password,
    verify_password,
    create_access_token,
)

from api.exceptions.user import (
    UserAlreadyExistsException,
    UserNotFoundException,
)

from api.exceptions.auth import (
    InvalidCredentialsException,
)


# ============================================================
# GET USERS
# ============================================================

def get_users():

    db = SessionLocal()

    try:
        return db.query(User).all()

    finally:
        db.close()


# ============================================================
# GET CURRENT USER PROFILE
# ============================================================

def get_profile(username: str):
    db = SessionLocal()

    try:
        user = db.query(User).filter(
            User.username == username
        ).first()

        if not user:
            raise UserNotFoundException()

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "website": user.website,
            "bio": user.bio,
            "role": user.role.value,
        }

    finally:
        db.close()

def add_user(user):

    db = SessionLocal()

    try:

        existing = db.query(User).filter(
            (User.username == user.username) |
            (User.email == user.email)
        ).first()

        if existing:
            raise UserAlreadyExistsException()

        if user.role.value == "administrator":

            administrator_exists = db.query(User).filter(
                User.role == "administrator"
            ).first()

            if administrator_exists:
                raise UserAlreadyExistsException()

        new_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hash_password(user.password),
            full_name=user.full_name,
            role=user.role
        )

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

        return {
            "message": "User created successfully",
            "id": new_user.id
        }

    except IntegrityError:

        db.rollback()

        raise UserAlreadyExistsException()

    finally:
        db.close()


# ============================================================
# LOGIN
# ============================================================

def login_user(
    username: str,
    password: str
):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.username == username
        ).first()

        if not user or not verify_password(
            password,
            user.hashed_password
        ):
            raise InvalidCredentialsException()

        token = create_access_token({
            "id": user.id,
            "sub": user.username,
            "role": user.role.value,
            "id": user.id
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role.value
            }
        }

    finally:
        db.close()


# ============================================================
# GET CURRENT PROFILE
# ============================================================

def get_profile(username: str):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.username == username
        ).first()

        if not user:
            raise UserNotFoundException()

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "phone": user.phone,
            "website": user.website,
            "bio": user.bio,
        }

    finally:
        db.close()


# ============================================================
# UPDATE PROFILE
# ============================================================

def update_profile(
    username: str,
    updates
):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.username == username
        ).first()

        if not user:
            raise UserNotFoundException()

        # --------------------------------------------------------
        # FULL NAME
        # --------------------------------------------------------

        if updates.full_name is not None:
            user.full_name = updates.full_name

        # --------------------------------------------------------
        # EMAIL
        # --------------------------------------------------------

        if updates.email is not None:

            existing_email = db.query(User).filter(
                User.email == updates.email,
                User.id != user.id
            ).first()

            if existing_email:
                raise UserAlreadyExistsException()

            user.email = updates.email

        # --------------------------------------------------------
        # PHONE
        # --------------------------------------------------------

        if updates.phone is not None:
            user.phone = updates.phone

        # --------------------------------------------------------
        # WEBSITE
        # --------------------------------------------------------

        if updates.website is not None:
            user.website = updates.website

        # --------------------------------------------------------
        # BIO
        # --------------------------------------------------------

        if updates.bio is not None:
            user.bio = updates.bio

        db.commit()

        db.refresh(user)

        return {
            "message": "Profile updated successfully",
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "phone": user.phone,
            "website": user.website,
            "bio": user.bio,
        }

    except IntegrityError:

        db.rollback()

        raise UserAlreadyExistsException()

    finally:
        db.close()


# ============================================================
# CHANGE PASSWORD
# ============================================================

def change_password(
    username: str,
    current_password: str,
    new_password: str
):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.username == username
        ).first()

        if not user or not verify_password(
            current_password,
            user.hashed_password
        ):
            raise InvalidCredentialsException()

        user.hashed_password = hash_password(
            new_password
        )

        db.commit()

        return {
            "message": "Password changed successfully"
        }

    finally:
        db.close()


# ============================================================
# DELETE USER
# ============================================================

def delete_user(user_id: int):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise UserNotFoundException()

        db.delete(user)

        db.commit()

        return {
            "message": f"User {user_id} deleted successfully"
        }

    finally:
        db.close()