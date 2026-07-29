from fastapi import APIRouter, Depends
<<<<<<< HEAD
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
=======

from api.auth.auth import get_current_user
from api.schemas.campaign import CampaignCreate, CampaignUpdate
from api.services.campaign_service import (
    create_campaign,
    delete_campaign,
    get_campaign,
    get_campaigns,
    update_campaign,
)

router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)


@router.get("/")
def read_campaigns():
    return get_campaigns()


@router.get("/{campaign_id}")
def read_campaign(campaign_id: int):
    return get_campaign(campaign_id)


@router.post("/")
def add_campaign(
    campaign: CampaignCreate,
    current_user=Depends(get_current_user)
):
    return create_campaign(campaign, current_user["id"])


@router.put("/{campaign_id}")
def edit_campaign(
    campaign_id: int,
    campaign: CampaignUpdate,
    current_user=Depends(get_current_user)
):
    return update_campaign(campaign_id, campaign)


@router.delete("/{campaign_id}")
def remove_campaign(
    campaign_id: int,
    current_user=Depends(get_current_user)
):
    return delete_campaign(campaign_id)
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)
