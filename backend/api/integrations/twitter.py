from requests_oauthlib import OAuth1Session

from api.core.config import settings


REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
AUTHORIZE_URL = "https://api.twitter.com/oauth/authorize"
ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"

USER_URL = "https://api.twitter.com/2/users/me"
TWEET_URL = "https://api.twitter.com/2/tweets"


def get_authorization_url():

    oauth = OAuth1Session(
        settings.X_CONSUMER_KEY,
        client_secret=settings.X_CONSUMER_SECRET,
        callback_uri=settings.X_CALLBACK_URL,
    )

    fetch_response = oauth.fetch_request_token(
        REQUEST_TOKEN_URL
    )

    return {
        "url": oauth.authorization_url(
            AUTHORIZE_URL
        ),
        "oauth_token": fetch_response["oauth_token"],
        "oauth_token_secret": fetch_response[
            "oauth_token_secret"
        ],
    }


def get_access_token(
    oauth_token,
    oauth_token_secret,
    verifier,
):

    oauth = OAuth1Session(
        settings.X_CONSUMER_KEY,
        client_secret=settings.X_CONSUMER_SECRET,
        resource_owner_key=oauth_token,
        resource_owner_secret=oauth_token_secret,
        verifier=verifier,
    )

    return oauth.fetch_access_token(
        ACCESS_TOKEN_URL
    )


def get_me(
    access_token,
    access_token_secret,
):

    oauth = OAuth1Session(
        settings.X_CONSUMER_KEY,
        client_secret=settings.X_CONSUMER_SECRET,
        resource_owner_key=access_token,
        resource_owner_secret=access_token_secret,
    )

    response = oauth.get(USER_URL)

    response.raise_for_status()

    return response.json()


def post_tweet(
    access_token,
    access_token_secret,
    text,
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
            "text": text,
        },
    )

    response.raise_for_status()

    return response.json()