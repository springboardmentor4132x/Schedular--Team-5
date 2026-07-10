from sqlalchemy.exc import IntegrityError
from api.database.session import SessionLocal
from api.models.user import User
from api.auth.auth import hash_password, verify_password, create_access_token
from api.exceptions.user import UserAlreadyExistsException
from api.exceptions.auth import InvalidCredentialsException


def get_users():
    db = SessionLocal()
    try:
        return db.query(User).all()
    finally:
        db.close()


def add_user(user):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(
            (User.username == user.username) | (User.email == user.email)
        ).first()
        if existing:
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
        return {"message": "User created successfully", "id": new_user.id}
    except IntegrityError:
        db.rollback()
        raise UserAlreadyExistsException()
    finally:
        db.close()


def login_user(username: str, password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.hashed_password):
            raise InvalidCredentialsException()

        token = create_access_token({"sub": user.username, "role": user.role.value})
        return {"access_token": token, "token_type": "bearer"}
    finally:
        db.close()