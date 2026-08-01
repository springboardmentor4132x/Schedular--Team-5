
import httpx
from api.core.config import settings

AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

class LinkedInService:

    @staticmethod
    def get_authorization_url(state: str) -> str:
        params = {
            "response_type": "code",
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "state": state,
            "scope": "openid profile email w_member_social",
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{AUTH_URL}?{query}"

    @staticmethod
    def exchange_code_for_token(code: str) -> dict:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        }
        response = httpx.post(TOKEN_URL, data=data, timeout=15)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def refresh_access_token(refresh_token: str) -> dict:
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        }
        response = httpx.post(TOKEN_URL, data=data, timeout=15)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def get_profile(access_token: str) -> dict:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = httpx.get(USERINFO_URL, headers=headers, timeout=15)
        response.raise_for_status()
        return response.json()
