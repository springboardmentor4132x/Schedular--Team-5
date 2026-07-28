from datetime import datetime, timezone

from api.database.session import SessionLocal
from api.models.campaign import Campaign
from api.models.post import Post
from api.models.business_assignment import BusinessAssignment
from api.models.user import User


def create_campaign(
    user_id: int,
    data,
):
    db = SessionLocal()

    try:
        existing_campaign = (
            db.query(Campaign)
            .filter(
                Campaign.user_id == user_id,
                Campaign.title == data.title,
            )
            .first()
        )

        if existing_campaign:
            raise ValueError(
                "A campaign with this title already exists"
            )

        if (
            data.end_date is not None
            and data.end_date < data.start_date
        ):
            raise ValueError(
                "Campaign end date must be after start date"
            )

        new_campaign = Campaign(
            user_id=user_id,
            title=data.title,
            description=data.description,
            platform=data.platform,
            budget=data.budget,
            objectives=data.objectives,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status,
        )

        db.add(new_campaign)
        db.commit()
        db.refresh(new_campaign)

        return new_campaign

    finally:
        db.close()


def list_campaigns(
    user_id: int,
):
    db = SessionLocal()

    try:
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


def list_client_campaigns(
    marketing_team_id: int,
    client_id: int,
):
    db = SessionLocal()

    try:
        marketing_team = (
            db.query(User)
            .filter(
                User.id == marketing_team_id,
                User.role == "marketing_team",
            )
            .first()
        )

        if not marketing_team:
            raise ValueError(
                "Marketing Team user not found"
            )

        assignment = (
            db.query(BusinessAssignment)
            .filter(
                BusinessAssignment.business_user_id == client_id,
                BusinessAssignment.marketing_team_id == marketing_team_id,
            )
            .first()
        )

        if not assignment:
            raise ValueError(
                "Client is not assigned to your Marketing Team"
            )

        client = (
            db.query(User)
            .filter(
                User.id == client_id,
                User.role == "business_user",
            )
            .first()
        )

        if not client:
            raise ValueError(
                "Client not found"
            )

        return (
            db.query(Campaign)
            .filter(
                Campaign.user_id == client_id
            )
            .order_by(
                Campaign.created_at.desc()
            )
            .all()
        )

    finally:
        db.close()


def get_campaign(
    user_id: int,
    campaign_id: int,
):
    db = SessionLocal()

    try:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.id == campaign_id,
                Campaign.user_id == user_id,
            )
            .first()
        )

        if not campaign:
            raise ValueError(
                f"Campaign {campaign_id} not found"
            )

        return campaign

    finally:
        db.close()


def update_campaign(
    user_id: int,
    campaign_id: int,
    data,
):
    db = SessionLocal()

    try:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.id == campaign_id,
                Campaign.user_id == user_id,
            )
            .first()
        )

        if not campaign:
            raise ValueError(
                f"Campaign {campaign_id} not found"
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        new_start_date = update_data.get(
            "start_date",
            campaign.start_date,
        )

        new_end_date = update_data.get(
            "end_date",
            campaign.end_date,
        )

        if (
            new_end_date is not None
            and new_end_date < new_start_date
        ):
            raise ValueError(
                "Campaign end date must be after start date"
            )

        if "title" in update_data:
            existing_campaign = (
                db.query(Campaign)
                .filter(
                    Campaign.user_id == user_id,
                    Campaign.title == update_data["title"],
                    Campaign.id != campaign_id,
                )
                .first()
            )

            if existing_campaign:
                raise ValueError(
                    "A campaign with this title already exists"
                )

        for field, value in update_data.items():
            setattr(
                campaign,
                field,
                value,
            )

        campaign.updated_at = datetime.now(
            timezone.utc
        )

        db.commit()
        db.refresh(campaign)

        return campaign

    finally:
        db.close()


def delete_campaign(
    user_id: int,
    campaign_id: int,
):
    db = SessionLocal()

    try:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.id == campaign_id,
                Campaign.user_id == user_id,
            )
            .first()
        )

        if not campaign:
            raise ValueError(
                f"Campaign {campaign_id} not found"
            )

        for post in campaign.posts:
            post.campaign_id = None

        db.delete(campaign)

        db.commit()

        return {
            "message": (
                f"Campaign {campaign_id} deleted successfully"
            )
        }

    finally:
        db.close()


def assign_post_to_campaign(
    user_id: int,
    campaign_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.id == campaign_id,
                Campaign.user_id == user_id,
            )
            .first()
        )

        if not campaign:
            raise ValueError(
                f"Campaign {campaign_id} not found"
            )

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id == user_id,
            )
            .first()
        )

        if not post:
            raise ValueError(
                f"Post {post_id} not found"
            )

        if post.campaign_id is not None:
            raise ValueError(
                f"Post {post_id} is already assigned to a campaign"
            )

        if (
            post.scheduled_time is not None
            and campaign.start_date is not None
            and post.scheduled_time < campaign.start_date
        ):
            raise ValueError(
                "Post scheduled time is before campaign start date"
            )

        if (
            post.scheduled_time is not None
            and campaign.end_date is not None
            and post.scheduled_time > campaign.end_date
        ):
            raise ValueError(
                "Post scheduled time is after campaign end date"
            )

        post.campaign_id = campaign_id

        db.commit()
        db.refresh(post)

        return post

    finally:
        db.close()


def remove_post_from_campaign(
    user_id: int,
    campaign_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.id == campaign_id,
                Campaign.user_id == user_id,
            )
            .first()
        )

        if not campaign:
            raise ValueError(
                f"Campaign {campaign_id} not found"
            )

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id == user_id,
            )
            .first()
        )

        if not post:
            raise ValueError(
                f"Post {post_id} not found"
            )

        if post.campaign_id != campaign_id:
            raise ValueError(
                f"Post {post_id} is not assigned to Campaign {campaign_id}"
            )

        post.campaign_id = None

        db.commit()
        db.refresh(post)

        return post

    finally:
        db.close()


def get_campaign_posts(
    user_id: int,
    campaign_id: int,
):
    db = SessionLocal()

    try:
        campaign = (
            db.query(Campaign)
            .filter(
                Campaign.id == campaign_id,
                Campaign.user_id == user_id,
            )
            .first()
        )

        if not campaign:
            raise ValueError(
                f"Campaign {campaign_id} not found"
            )

        return (
            db.query(Post)
            .filter(
                Post.user_id == user_id,
                Post.campaign_id == campaign_id,
            )
            .order_by(
                Post.scheduled_time.asc()
            )
            .all()
        )

    finally:
        db.close()