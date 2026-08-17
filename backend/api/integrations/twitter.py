from requests_oauthlib import OAuth1Session

from api.core.config import settings


REQUEST_TOKEN_URL = (
    "https://api.twitter.com/oauth/request_token"
)

AUTHORIZE_URL = (
    "https://api.twitter.com/oauth/authorize"
)

ACCESS_TOKEN_URL = (
    "https://api.twitter.com/oauth/access_token"
)

USER_URL = (
    "https://api.twitter.com/2/users/me"
)

TWEET_URL = (
    "https://api.twitter.com/2/tweets"
)


# Local development storage
# oauth_token -> {
#     "oauth_token_secret": "...",
#     "user_id": 3
# }
_request_tokens = {}


def get_authorization_url(user_id: int):

    oauth = OAuth1Session(
        settings.X_CONSUMER_KEY,
        client_secret=settings.X_CONSUMER_SECRET,
        callback_uri=settings.X_CALLBACK_URL,
    )

    response = oauth.fetch_request_token(
        REQUEST_TOKEN_URL
    )

    oauth_token = response.get("oauth_token")
    oauth_token_secret = response.get(
        "oauth_token_secret"
    )

    if not oauth_token or not oauth_token_secret:
        raise Exception(
            "Twitter request token missing"
        )

    # IMPORTANT:
    # Secret + application user id are stored together.
    _request_tokens[oauth_token] = {
        "oauth_token_secret": oauth_token_secret,
        "user_id": user_id,
    }

    authorization_url = oauth.authorization_url(
        AUTHORIZE_URL
    )

    return {
        "url": authorization_url,
        "oauth_token": oauth_token,
    }


def get_access_token(
    oauth_token: str,
    verifier: str,
):

    stored = _request_tokens.get(
        oauth_token
    )

    if not stored:
        raise Exception(
            "Twitter OAuth session expired or not found. "
            "Please start Twitter login again."
        )

    oauth_token_secret = stored.get(
        "oauth_token_secret"
    )

    if not oauth_token_secret:
        raise Exception(
            "Twitter OAuth token secret missing. "
            "Please start Twitter login again."
        )

    oauth = OAuth1Session(
        settings.X_CONSUMER_KEY,
        client_secret=settings.X_CONSUMER_SECRET,
        resource_owner_key=oauth_token,
        resource_owner_secret=oauth_token_secret,
        verifier=verifier,
    )

    token = oauth.fetch_access_token(
        ACCESS_TOKEN_URL
    )

    # Remove temporary request token
    _request_tokens.pop(
        oauth_token,
        None,
    )

    return token


def get_user_id_from_request_token(
    oauth_token: str,
):
    stored = _request_tokens.get(
        oauth_token
    )

    if not stored:
        return None

    return stored.get("user_id")


def get_me(
    access_token: str,
    access_token_secret: str,
):

    oauth = OAuth1Session(
        settings.X_CONSUMER_KEY,
        client_secret=settings.X_CONSUMER_SECRET,
        resource_owner_key=access_token,
        resource_owner_secret=access_token_secret,
    )

    response = oauth.get(
        USER_URL,
        params={
            "user.fields": (
                "id,"
                "name,"
                "username,"
                "description,"
                "profile_image_url,"
                "public_metrics"
            )
        },
    )

    response.raise_for_status()

    return response.json()


def get_public_metrics(
    access_token: str,
    access_token_secret: str,
):

    data = get_me(
        access_token,
        access_token_secret,
    )

    user_data = data.get(
        "data",
        {}
    )

    return user_data.get(
        "public_metrics",
        {}
    )


def post_tweet(
    access_token: str,
    access_token_secret: str,
    text: str,
):

    oauth = OAuth1Session(
        settings.X_CONSUMER_KEY,
        client_secret=settings.X_CONSUMER_SECRET,
        resource_owner_key=access_token,
        resource_owner_secret=access_token_secret,
    )

    response = oauth.post(
        TWEET_URL,
        json={
            "text": text
        },
    )

    response.raise_for_status()

    return response.json()