from urllib.parse import urlencode
import requests

from api.core.config import settings

AUTH_URL = "https://www.pinterest.com/oauth/"
TOKEN_URL = "https://api.pinterest.com/v5/oauth/token"
USER_URL = "https://api.pinterest.com/v5/user_account"


def get_authorization_url():

    params = {
        "response_type": "code",
        "client_id": settings.PINTEREST_CLIENT_ID,
        "redirect_uri": settings.PINTEREST_REDIRECT_URI,
        "scope": "boards:read,pins:read,pins:write,user_accounts:read"
    }

    return AUTH_URL + "?" + urlencode(params)


def get_access_token(code: str):

    payload = {
        "grant_type": "authorization_code",
        "client_id": settings.PINTEREST_CLIENT_ID,
        "client_secret": settings.PINTEREST_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.PINTEREST_REDIRECT_URI,
    }

    response = requests.post(
        TOKEN_URL,
        data=payload,
        headers={
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )

    response.raise_for_status()

    return response.json()


def get_profile(access_token: str):

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(
        USER_URL,
        headers=headers
    )

    response.raise_for_status()

    return response.json()