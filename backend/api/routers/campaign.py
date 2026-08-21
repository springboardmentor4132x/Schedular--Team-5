from fastapi import APIRouter, Depends

from api.auth.auth import get_current_user
from api.database.session import SessionLocal
from api.models.business_assignment import BusinessAssignment
from api.models.campaign import Campaign
from api.models.user import User
from api.roles.user import Role
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


# =========================================================
# GET LOGGED-IN USER ID
# =========================================================

def _get_user_id(current_user: dict) -> int:
    users = get_users()

    for user in users:
        if user.username == current_user["username"]:
            return user.id

    raise Exception("User not found")


# =========================================================
# LIST CAMPAIGNS
# =========================================================
#
# Marketing Team:
#   - Own campaigns
#   - Campaigns belonging to assigned Business Users
#
# Business User:
#   - Own campaigns
#   - Campaigns belonging to assigned Marketing Team
#
# Other roles:
#   - Own campaigns only
#
# =========================================================

@router.get(
    "/",
    response_model=list[CampaignResponse],
)
def list_campaigns(
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(
                User.id == user_id
            )
            .first()
        )

        if not user:
            raise ValueError("User not found")

        # -------------------------------------------------
        # MARKETING TEAM
        # -------------------------------------------------
        # Marketing Team sees:
        # 1. Its own campaigns
        # 2. Campaigns belonging to its assigned Business Users
        # -------------------------------------------------

        if user.role == Role.MARKETING_TEAM:

            assigned_client_ids = [
                assignment.business_user_id
                for assignment in (
                    db.query(BusinessAssignment)
                    .filter(
                        BusinessAssignment.marketing_team_id
                        == user_id
                    )
                    .all()
                )
            ]

            user_ids = [
                user_id,
                *assigned_client_ids,
            ]

            return (
                db.query(Campaign)
                .filter(
                    Campaign.user_id.in_(user_ids)
                )
                .order_by(
                    Campaign.created_at.desc()
                )
                .all()
            )

        # -------------------------------------------------
        # BUSINESS USER
        # -------------------------------------------------
        # Business User sees:
        # 1. Its own campaigns
        # 2. Campaigns created by its assigned Marketing Team
        # -------------------------------------------------

        if user.role == Role.BUSINESS_USER:

            assignment = (
                db.query(BusinessAssignment)
                .filter(
                    BusinessAssignment.business_user_id
                    == user_id
                )
                .first()
            )

            user_ids = [user_id]

            if assignment:
                user_ids.append(
                    assignment.marketing_team_id
                )

            return (
                db.query(Campaign)
                .filter(
                    Campaign.user_id.in_(user_ids)
                )
                .order_by(
                    Campaign.created_at.desc()
                )
                .all()
            )

        # -------------------------------------------------
        # OTHER ROLES
        # -------------------------------------------------

        return (
            db.query(Campaign)
            .filter(
                Campaign.user_id == user_id
            )
            .order_by(
                Campaign.created_at.desc()
            )
            .all()
        )

    finally:
        db.close()


# =========================================================
# LIST CLIENT CAMPAIGNS
# =========================================================

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


# =========================================================
# CREATE CLIENT CAMPAIGN
# =========================================================

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


# =========================================================
# CREATE CAMPAIGN
# =========================================================

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


# =========================================================
# GET CAMPAIGN
# =========================================================

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


# =========================================================
# UPDATE CAMPAIGN
# =========================================================

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


# =========================================================
# DELETE CAMPAIGN
# =========================================================

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


# =========================================================
# ASSIGN POST TO CAMPAIGN
# =========================================================

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


# =========================================================
# REMOVE POST FROM CAMPAIGN
# =========================================================

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


# =========================================================
# GET CAMPAIGN POSTS
# =========================================================

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