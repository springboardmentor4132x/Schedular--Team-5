import secrets
import hashlib
import base64
from urllib.parse import urlencode

import requests

from api.core.config import settings

AUTH_URL = "https://twitter.com/i/oauth2/authorize"
TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
USER_URL = "https://api.twitter.com/2/users/me"
TWEET_URL = "https://api.twitter.com/2/tweets"

SCOPES = [
    "tweet.read",
    "tweet.write",
    "users.read",
    "offline.access"
]


def generate_pkce():
    code_verifier = secrets.token_urlsafe(64)

    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).decode().replace("=", "")

    return code_verifier, code_challenge


def get_authorization_url():

    state = secrets.token_urlsafe(32)

    code_verifier, code_challenge = generate_pkce()

    params = {
        "response_type": "code",
        "client_id": settings.X_CLIENT_ID,
        "redirect_uri": settings.X_CALLBACK_URL,
        "scope": " ".join(SCOPES),
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256"
    }

    url = AUTH_URL + "?" + urlencode(params)

    return {
        "url": url,
        "state": state,
        "code_verifier": code_verifier
    }
def get_access_token(code: str, code_verifier: str):

    payload = {
        "grant_type": "authorization_code",
        "client_id": settings.X_CLIENT_ID,
        "redirect_uri": settings.X_CALLBACK_URL,
        "code": code,
        "code_verifier": code_verifier
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(
        TOKEN_URL,
        data=payload,
        headers=headers,
        auth=(settings.X_CLIENT_ID, settings.X_CLIENT_SECRET)
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


def post_tweet(access_token: str, text: str):

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    body = {
        "text": text
    }

    response = requests.post(
        TWEET_URL,
        headers=headers,
        json=body
    )

    print("STATUS:", response.status_code)
    print("BODY:", response.text)
    print("HEADERS:", response.headers)

    response.raise_for_status()

    return response.json()