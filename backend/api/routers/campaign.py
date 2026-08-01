from fastapi import APIRouter, Depends

from api.auth.auth import get_current_user
from api.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
)
from api.schemas.post import PostResponse
from api.services import campaign as service
from api.services.user import get_users


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"],
)


def _get_user_id(current_user: dict) -> int:
    users = get_users()

    for user in users:
        if user.username == current_user["username"]:
            return user.id

    raise Exception("User not found")


@router.get(
    "/",
    response_model=list[CampaignResponse],
)
def list_campaigns(
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.list_campaigns(
        user_id
    )


@router.get(
    "/client/{client_id}",
    response_model=list[CampaignResponse],
)
def list_client_campaigns(
    client_id: int,
    current_user=Depends(get_current_user),
):
    marketing_team_id = _get_user_id(current_user)

    return service.list_client_campaigns(
        marketing_team_id,
        client_id,
    )


@router.post(
    "/client/{client_id}",
    response_model=CampaignResponse,
)
def create_client_campaign(
    client_id: int,
    campaign: CampaignCreate,
    current_user=Depends(get_current_user),
):
    marketing_team_id = _get_user_id(current_user)

    return service.create_client_campaign(
        marketing_team_id,
        client_id,
        campaign,
    )


@router.post(
    "/",
    response_model=CampaignResponse,
)
def create_campaign(
    campaign: CampaignCreate,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.create_campaign(
        user_id,
        campaign,
    )


@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
)
def get_campaign(
    campaign_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.get_campaign(
        user_id,
        campaign_id,
    )


@router.put(
    "/{campaign_id}",
    response_model=CampaignResponse,
)
def update_campaign(
    campaign_id: int,
    campaign: CampaignUpdate,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.update_campaign(
        user_id,
        campaign_id,
        campaign,
    )


@router.delete(
    "/{campaign_id}",
)
def delete_campaign(
    campaign_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.delete_campaign(
        user_id,
        campaign_id,
    )


@router.post(
    "/{campaign_id}/posts/{post_id}",
    response_model=PostResponse,
)
def assign_post_to_campaign(
    campaign_id: int,
    post_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.assign_post_to_campaign(
        user_id,
        campaign_id,
        post_id,
    )


@router.delete(
    "/{campaign_id}/posts/{post_id}",
    response_model=PostResponse,
)
def remove_post_from_campaign(
    campaign_id: int,
    post_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.remove_post_from_campaign(
        user_id,
        campaign_id,
        post_id,
    )


@router.get(
    "/{campaign_id}/posts",
    response_model=list[PostResponse],
)
def get_campaign_posts(
    campaign_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.get_campaign_posts(
        user_id,
        campaign_id,
    )