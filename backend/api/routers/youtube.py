
from api.core.config import settings
from fastapi import APIRouter, HTTPException, Request
from fastapi_sso.sso.google import GoogleSSO

router = APIRouter(
    prefix='/youtube',
)

google_sso = GoogleSSO(
    client_id=settings.YOUTUBE_CLIENT_ID,
    client_secret=settings.YOUTUBE_CLIENT_SECRET,
    redirect_uri=settings.YOUTUBE_CALLBACK_URL,
    scope=["openid", "email", "profile", "https://www.googleapis.com/auth/youtube.force-ssl"],
    allow_insecure_http=True  # ONLY use True for local development
)

@router.get("/login")
async def auth_init():
    with google_sso:
        return await google_sso.get_login_redirect()

@router.get("/callback")
async def auth_callback(request: Request):
    with google_sso:
        try:
            # Intercept authorization response codes and parse out user profiles
            user = await google_sso.verify_and_process(request)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")
    return {
        "message": "Successfully authenticated via Google!",
        "user_details": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "picture": user.picture
        }
    }
