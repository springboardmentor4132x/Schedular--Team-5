from fastapi import HTTPException


class InvalidCredentialsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail="Invalid username or password"
        )


class InvalidTokenException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail="Invalid token"
        )


class ForbiddenException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=403,
            detail="Access denied"
        )