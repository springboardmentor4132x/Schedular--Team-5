from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from api.integrations import twitter

router = APIRouter(
    prefix="/auth/twitter",
    tags=["Twitter"]
)

# Temporary memory (baad me DB/Redis me store karenge)
pkce_store = {}


@router.get("/login")
def twitter_login():

    data = twitter.get_authorization_url()

    pkce_store[data["state"]] = data["code_verifier"]

    return RedirectResponse(data["url"])


@router.get("/callback")
def twitter_callback(
    code: str,
    state: str | None = None
):

    if state:
        code_verifier = pkce_store.get(state)
    else:
        if len(pkce_store) == 0:
            raise HTTPException(
                status_code=400,
                detail="Code verifier not found"
            )

        code_verifier = list(pkce_store.values())[0]
        pkce_store.clear()

    token = twitter.get_access_token(
        code,
        code_verifier
    )

    return token


@router.get("/me")
def twitter_me(access_token: str):

    return twitter.get_profile(access_token)


@router.post("/tweet")
def create_tweet(
    access_token: str,
    text: str
):

    return twitter.post_tweet(
        access_token,
        text
    )