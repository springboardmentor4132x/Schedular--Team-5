from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from api.integrations import pinterest

router = APIRouter(
    prefix="/auth/pinterest",
    tags=["Pinterest"]
)


@router.get("/login")
def pinterest_login():
    url = pinterest.get_authorization_url()
    return RedirectResponse(url)


@router.get("/callback")
def pinterest_callback(code: str):
    try:
        token = pinterest.get_access_token(code)
        return token
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
def pinterest_me(access_token: str):
    try:
        profile = pinterest.get_profile(access_token)
        return profile
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))