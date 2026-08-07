
from fastapi import HTTPException, status

RETRIEVING_LINKEDIN_PROFILE_FAILED_EXCEPTION = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="failed to retrieve profile"
)

RETRIEVING_API_TOKEN_FAILED_EXCEPTION = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="failed to retrieve API token"
)

LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="account not found"
)

YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="channel not found"
)

YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="account not found"
)

YOUTUBE_VIDEO_NOT_FOUND_EXCEPTION = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="video not found"
)

CAMPAIGN_NOT_FOUND_EXCEPTION = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="campaign not found"
)

RETRIEVE_CHANNEL_INFO_FAILED_EXCEPTION = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="failed to retrieve YouTube channel info"
)

MISSING_ACCESS_TOKEN_EXCEPTION = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="refresh token missing. re-authentication required."
)

REFRESH_ACCESS_TOKEN_FAILED = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="failed to refresh access token."
)
