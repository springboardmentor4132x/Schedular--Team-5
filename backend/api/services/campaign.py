from datetime import datetime, timezone

from api.database.session import SessionLocal
from api.models.business_assignment import BusinessAssignment
from api.models.campaign import Campaign
from api.models.post import Post
from api.models.user import User
from api.roles.user import Role
from api.services.notification import create_notification
from api.services.team_activity import create_team_activity


# =========================================================
# INTERNAL NOTIFICATION HELPERS
# =========================================================

def _create_campaign_notification(
    user_id: int,
    title: str,
    description: str,
    notification_type: str = "info",
    campaign_id: int | None = None,
    post_id: int | None = None,
):
    """
    Create a campaign-related notification.

    Notification failures are logged but do not break
    the main campaign operation.
    """

    try:
        notification = create_notification(
            user_id=user_id,
            title=title,
            description=description,
            notification_type=notification_type,
            category="campaign",
            delivery_channel="in_app",
            related_campaign_id=campaign_id,
            related_post_id=post_id,
        )

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CAMPAIGN NOTIFICATION HOOK EXECUTED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign_id}",
            flush=True,
        )
        print(
            f">>> POST ID: {post_id}",
            flush=True,
        )
        print(
            f">>> TITLE: {title}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return notification

    except Exception as exc:
        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CAMPAIGN NOTIFICATION FAILED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign_id}",
            flush=True,
        )
        print(
            f">>> POST ID: {post_id}",
            flush=True,
        )
        print(
            f">>> ERROR: {exc}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return None


# =========================================================
# INTERNAL TEAM ACTIVITY HELPER
# =========================================================

def _create_campaign_team_activity(
    user_id: int,
    activity_type: str,
    title: str,
    description: str,
    campaign_id: int | None = None,
    post_id: int | None = None,
):
    """
    Create a Team Activity entry.

    Team activity failures must never break the
    main campaign operation.
    """

    try:
        activity = create_team_activity(
            user_id=user_id,
            activity_type=activity_type,
            title=title,
            description=description,
            related_campaign_id=campaign_id,
            related_post_id=post_id,
        )

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CAMPAIGN TEAM ACTIVITY HOOK EXECUTED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> TYPE: {activity_type}",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign_id}",
            flush=True,
        )
        print(
            f">>> POST ID: {post_id}",
            flush=True,
        )
        print(
            f">>> TITLE: {title}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return activity

    except Exception as exc:
        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CAMPAIGN TEAM ACTIVITY FAILED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> TYPE: {activity_type}",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign_id}",
            flush=True,
        )
        print(
            f">>> POST ID: {post_id}",
            flush=True,
        )
        print(
            f">>> ERROR: {exc}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return None


# =========================================================
# GET ASSIGNED CLIENT
# =========================================================

def _get_assigned_client(
    db,
    marketing_team_id: int,
    client_id: int,
):
    marketing_team = (
        db.query(User)
        .filter(
            User.id == marketing_team_id,
            User.role == Role.MARKETING_TEAM,
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
            User.role == Role.BUSINESS_USER,
        )
        .first()
    )

    if not client:
        raise ValueError(
            "Client not found"
        )

    return client


# =========================================================
# GET CAMPAIGN FOR USER
# =========================================================

def _get_campaign_for_user(
    db,
    user_id: int,
    campaign_id: int,
):
    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id,
            Campaign.user_id == user_id,
        )
        .first()
    )

    if campaign:
        return campaign

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user and user.role == Role.MARKETING_TEAM:

        campaign = (
            db.query(Campaign)
            .join(
                BusinessAssignment,
                BusinessAssignment.business_user_id
                == Campaign.user_id,
            )
            .filter(
                Campaign.id == campaign_id,
                BusinessAssignment.marketing_team_id
                == user_id,
            )
            .first()
        )

    if not campaign:
        raise ValueError(
            f"Campaign {campaign_id} not found"
        )

    return campaign


# =========================================================
# GET POST FOR USER
# =========================================================

def _get_post_for_user(
    db,
    user_id: int,
    post_id: int,
):
    post = (
        db.query(Post)
        .filter(
            Post.id == post_id,
            Post.user_id == user_id,
        )
        .first()
    )

    if post:
        return post

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user and user.role == Role.MARKETING_TEAM:

        post = (
            db.query(Post)
            .join(
                BusinessAssignment,
                BusinessAssignment.business_user_id
                == Post.user_id,
            )
            .filter(
                Post.id == post_id,
                BusinessAssignment.marketing_team_id
                == user_id,
            )
            .first()
        )

    if not post:
        raise ValueError(
            f"Post {post_id} not found"
        )

    return post


# =========================================================
# CREATE CAMPAIGN
# =========================================================

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

        campaign = Campaign(
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

        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CAMPAIGN CREATED",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign.id}",
            flush=True,
        )
        print(
            f">>> TITLE: {campaign.title}",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        # -------------------------------------------------
        # CAMPAIGN CREATED NOTIFICATION
        # -------------------------------------------------

        _create_campaign_notification(
            user_id=user_id,
            title="Campaign Created",
            description=(
                f"Campaign '{campaign.title}' "
                "was created successfully."
            ),
            notification_type="success",
            campaign_id=campaign.id,
        )

        # -------------------------------------------------
        # CAMPAIGN CREATED TEAM ACTIVITY
        # -------------------------------------------------

        _create_campaign_team_activity(
            user_id=user_id,
            activity_type="campaign_created",
            title="Campaign Created",
            description=(
                f"Campaign '{campaign.title}' "
                "was created."
            ),
            campaign_id=campaign.id,
        )

        return campaign

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =========================================================
# CREATE CLIENT CAMPAIGN
# =========================================================

def create_client_campaign(
    marketing_team_id: int,
    client_id: int,
    data,
):
    db = SessionLocal()

    try:

        client = _get_assigned_client(
            db,
            marketing_team_id,
            client_id,
        )

        existing_campaign = (
            db.query(Campaign)
            .filter(
                Campaign.user_id == client_id,
                Campaign.title == data.title,
            )
            .first()
        )

        if existing_campaign:
            raise ValueError(
                "A campaign with this title already exists for this client"
            )

        if (
            data.end_date is not None
            and data.end_date < data.start_date
        ):
            raise ValueError(
                "Campaign end date must be after start date"
            )

        campaign = Campaign(
            user_id=client_id,
            title=data.title,
            description=data.description,
            platform=data.platform,
            budget=data.budget,
            objectives=data.objectives,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status,
        )

        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CLIENT CAMPAIGN CREATED",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign.id}",
            flush=True,
        )
        print(
            f">>> TITLE: {campaign.title}",
            flush=True,
        )
        print(
            f">>> CLIENT ID: {client_id}",
            flush=True,
        )
        print(
            f">>> MARKETING TEAM ID: {marketing_team_id}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        # -------------------------------------------------
        # NOTIFY CLIENT
        # -------------------------------------------------

        _create_campaign_notification(
            user_id=client_id,
            title="Campaign Created",
            description=(
                f"Campaign '{campaign.title}' "
                "was created successfully."
            ),
            notification_type="success",
            campaign_id=campaign.id,
        )

        # -------------------------------------------------
        # NOTIFY MARKETING TEAM
        # -------------------------------------------------

        _create_campaign_notification(
            user_id=marketing_team_id,
            title="Client Campaign Created",
            description=(
                f"Campaign '{campaign.title}' "
                "was created for your assigned client."
            ),
            notification_type="info",
            campaign_id=campaign.id,
        )

        # -------------------------------------------------
        # TEAM ACTIVITY - CAMPAIGN ASSIGNMENT
        # -------------------------------------------------

        _create_campaign_team_activity(
            user_id=marketing_team_id,
            activity_type="campaign_assignment",
            title="Campaign Assigned",
            description=(
                f"Campaign '{campaign.title}' "
                f"was created for client '{client.username}'."
            ),
            campaign_id=campaign.id,
        )

        return campaign

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =========================================================
# LIST CAMPAIGNS
# =========================================================

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


# =========================================================
# LIST CLIENT CAMPAIGNS
# =========================================================

def list_client_campaigns(
    marketing_team_id: int,
    client_id: int,
):
    db = SessionLocal()

    try:

        _get_assigned_client(
            db,
            marketing_team_id,
            client_id,
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


# =========================================================
# GET CAMPAIGN
# =========================================================

def get_campaign(
    user_id: int,
    campaign_id: int,
):
    db = SessionLocal()

    try:
        return _get_campaign_for_user(
            db,
            user_id,
            campaign_id,
        )

    finally:
        db.close()


# =========================================================
# UPDATE CAMPAIGN
# =========================================================

def update_campaign(
    user_id: int,
    campaign_id: int,
    data,
):
    db = SessionLocal()

    try:

        campaign = _get_campaign_for_user(
            db,
            user_id,
            campaign_id,
        )

        old_title = campaign.title
        old_status = campaign.status

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
            and new_start_date is not None
            and new_end_date < new_start_date
        ):
            raise ValueError(
                "Campaign end date must be after start date"
            )

        if "title" in update_data:

            existing_campaign = (
                db.query(Campaign)
                .filter(
                    Campaign.user_id == campaign.user_id,
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

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CAMPAIGN UPDATED",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign.id}",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> OLD TITLE: {old_title}",
            flush=True,
        )
        print(
            f">>> NEW TITLE: {campaign.title}",
            flush=True,
        )
        print(
            f">>> OLD STATUS: {old_status}",
            flush=True,
        )
        print(
            f">>> NEW STATUS: {campaign.status}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        # -------------------------------------------------
        # CAMPAIGN UPDATED NOTIFICATION
        # -------------------------------------------------

        _create_campaign_notification(
            user_id=user_id,
            title="Campaign Updated",
            description=(
                f"Campaign '{campaign.title}' "
                "was updated successfully."
            ),
            notification_type="info",
            campaign_id=campaign.id,
        )

        # -------------------------------------------------
        # CAMPAIGN UPDATED TEAM ACTIVITY
        # -------------------------------------------------

        _create_campaign_team_activity(
            user_id=user_id,
            activity_type="campaign_updated",
            title="Campaign Updated",
            description=(
                f"Campaign '{campaign.title}' "
                "was updated."
            ),
            campaign_id=campaign.id,
        )

        # -------------------------------------------------
        # CAMPAIGN STARTED
        # -------------------------------------------------

        if (
            old_status != campaign.status
            and str(campaign.status).lower()
            in {"started", "active", "running"}
        ):

            _create_campaign_notification(
                user_id=user_id,
                title="Campaign Started",
                description=(
                    f"Campaign '{campaign.title}' "
                    "has started."
                ),
                notification_type="success",
                campaign_id=campaign.id,
            )

            _create_campaign_team_activity(
                user_id=user_id,
                activity_type="campaign_started",
                title="Campaign Started",
                description=(
                    f"Campaign '{campaign.title}' "
                    "has started."
                ),
                campaign_id=campaign.id,
            )

        # -------------------------------------------------
        # CAMPAIGN COMPLETED
        # -------------------------------------------------

        if (
            old_status != campaign.status
            and str(campaign.status).lower()
            in {"completed", "complete", "finished"}
        ):

            _create_campaign_notification(
                user_id=user_id,
                title="Campaign Completed",
                description=(
                    f"Campaign '{campaign.title}' "
                    "has been completed."
                ),
                notification_type="success",
                campaign_id=campaign.id,
            )

            _create_campaign_team_activity(
                user_id=user_id,
                activity_type="campaign_completed",
                title="Campaign Completed",
                description=(
                    f"Campaign '{campaign.title}' "
                    "has been completed."
                ),
                campaign_id=campaign.id,
            )

        return campaign

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =========================================================
# DELETE CAMPAIGN
# =========================================================

def delete_campaign(
    user_id: int,
    campaign_id: int,
):
    db = SessionLocal()

    try:

        campaign = _get_campaign_for_user(
            db,
            user_id,
            campaign_id,
        )

        campaign_title = campaign.title

        for post in campaign.posts:
            post.campaign_id = None

        db.delete(campaign)
        db.commit()

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> CAMPAIGN DELETED",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign_id}",
            flush=True,
        )
        print(
            f">>> TITLE: {campaign_title}",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        _create_campaign_notification(
            user_id=user_id,
            title="Campaign Deleted",
            description=(
                f"Campaign '{campaign_title}' "
                f"(ID #{campaign_id}) was deleted successfully."
            ),
            notification_type="info",
            campaign_id=None,
        )

        return {
            "message": (
                f"Campaign {campaign_id} deleted successfully"
            )
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =========================================================
# ASSIGN POST TO CAMPAIGN
# =========================================================

def assign_post_to_campaign(
    user_id: int,
    campaign_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        campaign = _get_campaign_for_user(
            db,
            user_id,
            campaign_id,
        )

        post = _get_post_for_user(
            db,
            user_id,
            post_id,
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

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> POST ASSIGNED TO CAMPAIGN",
            flush=True,
        )
        print(
            f">>> POST ID: {post_id}",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign_id}",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        # -------------------------------------------------
        # POST ADDED TO CAMPAIGN NOTIFICATION
        # -------------------------------------------------

        _create_campaign_notification(
            user_id=user_id,
            title="Post Added to Campaign",
            description=(
                f"Post #{post_id} was added to "
                f"campaign '{campaign.title}'."
            ),
            notification_type="success",
            campaign_id=campaign_id,
            post_id=post_id,
        )

        # -------------------------------------------------
        # POST ADDED TO CAMPAIGN TEAM ACTIVITY
        # -------------------------------------------------

        _create_campaign_team_activity(
            user_id=user_id,
            activity_type="post_added_to_campaign",
            title="Post Added to Campaign",
            description=(
                f"Post #{post_id} was added to "
                f"campaign '{campaign.title}'."
            ),
            campaign_id=campaign_id,
            post_id=post_id,
        )

        return post

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =========================================================
# REMOVE POST FROM CAMPAIGN
# =========================================================

def remove_post_from_campaign(
    user_id: int,
    campaign_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        campaign = _get_campaign_for_user(
            db,
            user_id,
            campaign_id,
        )

        post = _get_post_for_user(
            db,
            user_id,
            post_id,
        )

        if post.campaign_id != campaign.id:
            raise ValueError(
                f"Post {post_id} is not assigned to Campaign {campaign_id}"
            )

        campaign_title = campaign.title

        post.campaign_id = None

        db.commit()
        db.refresh(post)

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> POST REMOVED FROM CAMPAIGN",
            flush=True,
        )
        print(
            f">>> POST ID: {post_id}",
            flush=True,
        )
        print(
            f">>> CAMPAIGN ID: {campaign_id}",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        # -------------------------------------------------
        # POST REMOVED FROM CAMPAIGN NOTIFICATION
        # -------------------------------------------------

        _create_campaign_notification(
            user_id=user_id,
            title="Post Removed from Campaign",
            description=(
                f"Post #{post_id} was removed from "
                f"campaign '{campaign_title}'."
            ),
            notification_type="info",
            campaign_id=campaign_id,
            post_id=post_id,
        )

        # -------------------------------------------------
        # POST REMOVED FROM CAMPAIGN TEAM ACTIVITY
        # -------------------------------------------------

        _create_campaign_team_activity(
            user_id=user_id,
            activity_type="post_removed_from_campaign",
            title="Post Removed from Campaign",
            description=(
                f"Post #{post_id} was removed from "
                f"campaign '{campaign_title}'."
            ),
            campaign_id=campaign_id,
            post_id=post_id,
        )

        return post

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =========================================================
# GET CAMPAIGN POSTS
# =========================================================

def get_campaign_posts(
    user_id: int,
    campaign_id: int,
):
    db = SessionLocal()

    try:

        _get_campaign_for_user(
            db,
            user_id,
            campaign_id,
        )

        return (
            db.query(Post)
            .filter(
                Post.campaign_id == campaign_id,
            )
            .order_by(
                Post.scheduled_time.asc()
            )
            .all()
        )

    finally:
        db.close()