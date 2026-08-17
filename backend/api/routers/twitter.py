from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.auth.auth import get_current_user
from api.database.session import SessionLocal
from api.integrations import twitter
from api.models.social_account import SocialAccount
from api.roles.social_account import Platform


router = APIRouter(
    prefix="/auth/twitter",
    tags=["Twitter"],
)


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_user_id(current_user):

    if isinstance(current_user, dict):

        user_id = current_user.get("id")

    else:

        user_id = getattr(
            current_user,
            "id",
            None,
        )

    if not user_id:

        raise HTTPException(
            status_code=401,
            detail="User ID not found",
        )

    return int(user_id)


# =========================================================
# START TWITTER LOGIN
# =========================================================

@router.get("/login")
def twitter_login(
    current_user=Depends(get_current_user),
):

    user_id = get_user_id(
        current_user
    )

    try:

        result = twitter.get_authorization_url(
            user_id=user_id
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# =========================================================
# TWITTER CALLBACK
# =========================================================
#
# IMPORTANT:
# DO NOT put get_current_user here.
#
# Twitter redirects the browser here and does not send
# our application's JWT Authorization header.
#
# The user_id is recovered from the temporary OAuth token.
# =========================================================

@router.get("/callback")
def twitter_callback(
    oauth_token: str,
    oauth_verifier: str,
    db: Session = Depends(get_db),
):

    print("\n==============================")
    print("TWITTER CALLBACK")
    print("==============================")

    print(
        "oauth_token:",
        oauth_token
    )

    print(
        "oauth_verifier received:",
        bool(oauth_verifier)
    )

    try:

        # -------------------------------------------------
        # Find application user BEFORE exchanging token
        # -------------------------------------------------

        user_id = twitter.get_user_id_from_request_token(
            oauth_token
        )

        print(
            "matched user id:",
            user_id
        )

        if not user_id:

            raise Exception(
                "Twitter OAuth session not found. "
                "Please start Twitter login again."
            )

        # -------------------------------------------------
        # Exchange request token for access token
        # -------------------------------------------------

        token = twitter.get_access_token(
            oauth_token=oauth_token,
            verifier=oauth_verifier,
        )

        access_token = token.get(
            "oauth_token"
        )

        access_token_secret = token.get(
            "oauth_token_secret"
        )

        if (
            not access_token
            or not access_token_secret
        ):

            raise Exception(
                "Twitter access token missing"
            )

        print(
            "Twitter access token received"
        )

        # -------------------------------------------------
        # Get Twitter profile
        # -------------------------------------------------

        profile = twitter.get_me(
            access_token,
            access_token_secret,
        )

        data = profile.get(
            "data",
            {}
        )

        if not data:

            raise Exception(
                "Twitter user data missing"
            )

        account_id = str(
            data.get("id")
        )

        username = data.get(
            "username",
            "Twitter Account",
        )

        if not account_id:

            raise Exception(
                "Twitter user id missing"
            )

        # -------------------------------------------------
        # Check existing account
        # -------------------------------------------------

        existing_account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.user_id
                == user_id,

                SocialAccount.platform
                == Platform.TWITTER,

                SocialAccount.account_id
                == account_id,
            )
            .first()
        )

        # -------------------------------------------------
        # Reconnect existing Twitter account
        # -------------------------------------------------

        if existing_account:

            existing_account.access_token = (
                access_token
            )

            existing_account.refresh_token = (
                access_token_secret
            )

            existing_account.account_name = (
                username
            )

            existing_account.is_connected = True

            db.commit()
            db.refresh(
                existing_account
            )

            print(
                "Twitter account reconnected:",
                existing_account.id
            )

            return {
                "message": (
                    "Twitter account "
                    "reconnected successfully"
                ),
                "account": {
                    "id": existing_account.id,
                    "name": (
                        existing_account.account_name
                    ),
                    "username": username,
                },
            }

        # -------------------------------------------------
        # Create new SocialAccount
        # -------------------------------------------------

        account = SocialAccount(
            user_id=user_id,

            platform=Platform.TWITTER,

            account_name=username,

            account_id=account_id,

            access_token=access_token,

            # Your model currently uses refresh_token
            # to store the Twitter OAuth1 secret.
            refresh_token=access_token_secret,

            is_connected=True,
        )

        db.add(account)

        db.commit()

        db.refresh(account)

        print(
            "Twitter account connected:",
            account.id
        )

        return {
            "message": (
                "Twitter account "
                "connected successfully"
            ),
            "account": {
                "id": account.id,
                "name": account.account_name,
                "username": username,
            },
        }

    except HTTPException:

        raise

    except Exception as e:

        db.rollback()

        print(
            "Twitter callback error:",
            str(e)
        )

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# =========================================================
# CREATE TWEET
# =========================================================

@router.post("/tweet")
def create_tweet(
    text: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    user_id = get_user_id(
        current_user
    )

    account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.user_id
            == user_id,

            SocialAccount.platform
            == Platform.TWITTER,

            SocialAccount.is_connected.is_(
                True
            ),
        )
        .first()
    )

    if not account:

        raise HTTPException(
            status_code=404,
            detail=(
                "Twitter account not connected"
            ),
        )

    try:

        return twitter.post_tweet(
            access_token=account.access_token,
            access_token_secret=account.refresh_token,
            text=text,
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# =========================================================
# TWITTER PROFILE
# =========================================================

@router.get("/me")
def twitter_me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    user_id = get_user_id(
        current_user
    )

    account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.user_id
            == user_id,

            SocialAccount.platform
            == Platform.TWITTER,

            SocialAccount.is_connected.is_(
                True
            ),
        )
        .first()
    )

    if not account:

        raise HTTPException(
            status_code=404,
            detail=(
                "Twitter account not connected"
            ),
        )

    try:

        return twitter.get_me(
            account.access_token,
            account.refresh_token,
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# =========================================================
# TWITTER PUBLIC METRICS
# =========================================================

@router.get("/metrics")
def twitter_metrics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    user_id = get_user_id(
        current_user
    )

    account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.user_id
            == user_id,

            SocialAccount.platform
            == Platform.TWITTER,

            SocialAccount.is_connected.is_(
                True
            ),
        )
        .first()
    )

    if not account:

        raise HTTPException(
            status_code=404,
            detail=(
                "Twitter account not connected"
            ),
        )

    try:

        metrics = twitter.get_public_metrics(
            account.access_token,
            account.refresh_token,
        )

        return metrics

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )