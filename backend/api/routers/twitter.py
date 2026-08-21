from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse

from api.auth.auth import get_current_user
from api.integrations import twitter
from api.services import social_account as service

router = APIRouter(
    prefix="/auth/twitter",
    tags=["Twitter"],
)

oauth_store = {}


@router.get("/login")
def twitter_login(
    current_user=Depends(get_current_user),
):
    print("========== CURRENT USER ==========")
    print(current_user)
    print("==================================")

    data = twitter.get_authorization_url()

    oauth_store[data["oauth_token"]] = {
        "oauth_token_secret": data["oauth_token_secret"],
        "user_id": current_user["id"],
    }

    print("========== OAUTH STORE ==========")
    print(oauth_store[data["oauth_token"]])
    print("=================================")

    return {
        "url": data["url"]
    }


@router.get("/callback")
def twitter_callback(
    oauth_token: str,
    oauth_verifier: str,
):
    data = oauth_store.get(oauth_token)

    print("========== CALLBACK DATA ==========")
    print(data)
    print("===================================")

    if not data:
        raise HTTPException(
            status_code=400,
            detail="OAuth token not found",
        )

    token = twitter.get_access_token(
        oauth_token,
        data["oauth_token_secret"],
        oauth_verifier,
    )

    print("========== TWITTER TOKEN ==========")
    print(token)
    print("===================================")

    service.create_account_from_oauth(
        user_id=data["user_id"],
        platform="twitter",
        account_name=token["screen_name"],
        token_data={
            "access_token": token["oauth_token"],
        },
        real_account_id=str(token["user_id"]),
    )

    print("========== ACCOUNT SAVED ==========")

    oauth_store.pop(oauth_token)

    return RedirectResponse(
        url="http://localhost:5173/app/accounts"
    )


@router.post("/tweet")
def create_tweet(
    access_token: str,
    access_token_secret: str,
    text: str,
):
    return twitter.post_tweet(
        access_token,
        access_token_secret,
        text,
    )