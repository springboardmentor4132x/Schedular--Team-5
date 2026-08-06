from datetime import datetime, timezone as dt_timezone
from zoneinfo import ZoneInfo

from api.database.session import SessionLocal
from api.exceptions.post import PostNotFoundException
from api.models.business_assignment import BusinessAssignment
from api.models.post import Post
from api.models.post_social_account import PostSocialAccount
from api.models.user import User
from api.roles.post import Status
from api.roles.post_social_account import PublishStatus
from api.roles.user import Role


DEFAULT_TIMEZONE = "Asia/Kolkata"


# =========================================================
# TIMEZONE
# =========================================================

def _convert_to_utc(
    scheduled_time,
    timezone_name,
):
    if scheduled_time is None:
        return None

    timezone_name = (
        timezone_name
        or DEFAULT_TIMEZONE
    )

    try:
        user_timezone = ZoneInfo(
            timezone_name
        )
    except Exception:
        raise ValueError(
            f"Invalid timezone: {timezone_name}"
        )

    if scheduled_time.tzinfo is None:
        scheduled_time = scheduled_time.replace(
            tzinfo=user_timezone
        )

    return scheduled_time.astimezone(
        dt_timezone.utc
    )


# =========================================================
# CLIENT VALIDATION
# =========================================================

def _validate_client(
    db,
    client_id: int,
):
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


def _is_client_assigned_to_marketing_team(
    db,
    marketing_team_id: int,
    client_id: int,
):
    assignment = (
        db.query(BusinessAssignment)
        .filter(
            BusinessAssignment.business_user_id == client_id,
            BusinessAssignment.marketing_team_id == marketing_team_id,
        )
        .first()
    )

    return assignment is not None


# =========================================================
# SOCIAL ACCOUNT VALIDATION
# =========================================================

def _validate_social_accounts(
    db,
    social_account_ids: list[int],
):
    if not social_account_ids:
        return

    from api.models.social_account import SocialAccount

    accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.id.in_(
                social_account_ids
            )
        )
        .all()
    )

    found_ids = {
        account.id
        for account in accounts
    }

    missing_ids = [
        account_id
        for account_id in social_account_ids
        if account_id not in found_ids
    ]

    if missing_ids:
        raise ValueError(
            f"Social account(s) not found: {missing_ids}"
        )


# =========================================================
# ATTACH SOCIAL ACCOUNTS TO POST
# =========================================================

def _attach_platforms(
    db,
    post: Post,
    social_account_ids: list[int],
):
    _validate_social_accounts(
        db,
        social_account_ids,
    )

    db.query(
        PostSocialAccount
    ).filter(
        PostSocialAccount.post_id == post.id
    ).delete(
        synchronize_session=False
    )

    for account_id in social_account_ids:
        db.add(
            PostSocialAccount(
                post_id=post.id,
                social_account_id=account_id,
                publish_status=PublishStatus.SCHEDULED,
            )
        )


# =========================================================
# PREPARE SOCIAL ACCOUNT DATA
# =========================================================

def _load_social_accounts(
    post: Post,
):
    """
    Convert the PostSocialAccount relationships into
    plain dictionaries.

    We explicitly access social_account while the DB
    session is still open so the response does not depend
    on lazy-loading after the session is closed.
    """

    social_accounts = []

    for relation in (
        post.post_social_accounts
        or []
    ):
        account = relation.social_account

        if not account:
            continue

        platform = getattr(
            account,
            "platform",
            None,
        )

        if hasattr(
            platform,
            "value",
        ):
            platform = platform.value

        social_accounts.append(
            {
                "id": account.id,

                "platform": (
                    str(platform).lower()
                    if platform
                    else "unknown"
                ),

                "account_name": getattr(
                    account,
                    "account_name",
                    None,
                ),

                "account_id": (
                    str(account.account_id)
                    if getattr(
                        account,
                        "account_id",
                        None,
                    ) is not None
                    else None
                ),

                "publish_status": (
                    relation.publish_status
                ),

                "platform_post_id": (
                    relation.platform_post_id
                ),
            }
        )

    return social_accounts


# =========================================================
# PREPARE POST RESPONSE
# =========================================================

def _serialize_post(
    post: Post,
):
    """
    Return a response dictionary containing the normal
    post fields PLUS the connected social accounts.
    """

    return {
        "id": post.id,
        "user_id": post.user_id,
        "campaign_id": post.campaign_id,

        "content": post.content,

        "media_url": post.media_url,

        "media_type": post.media_type,

        "scheduled_time": post.scheduled_time,

        "timezone": post.timezone,

        "published_time": post.published_time,

        "status": post.status,

        "created_at": post.created_at,

        "updated_at": post.updated_at,

        "social_accounts": _load_social_accounts(
            post
        ),
    }


# =========================================================
# CREATE POST
# =========================================================

def create_post(
    user_id: int,
    data,
    current_user_role: str,
):
    db = SessionLocal()

    try:

        if (
            current_user_role
            == Role.MARKETING_TEAM.value
        ):

            if data.client_id is None:
                raise ValueError(
                    "client_id is required for Marketing Team users"
                )

            _validate_client(
                db,
                data.client_id,
            )

            if not _is_client_assigned_to_marketing_team(
                db,
                user_id,
                data.client_id,
            ):
                raise ValueError(
                    "Client is not assigned to your Marketing Team"
                )

            post_owner_id = data.client_id

        elif (
            current_user_role
            == Role.CONTENT_CREATOR.value
        ):

            if data.client_id is not None:
                raise ValueError(
                    "Content Creator cannot create posts for another client"
                )

            post_owner_id = user_id

        elif (
            current_user_role
            == Role.ADMINISTRATOR.value
        ):

            if data.client_id is not None:

                _validate_client(
                    db,
                    data.client_id,
                )

                post_owner_id = data.client_id

            else:
                post_owner_id = user_id

        else:
            raise ValueError(
                "You are not authorized to create posts"
            )

        timezone_name = (
            data.timezone
            or DEFAULT_TIMEZONE
        )

        scheduled_time = _convert_to_utc(
            data.scheduled_time,
            timezone_name,
        )

        if data.save_as_draft:

            post_status = Status.DRAFT

        else:

            if scheduled_time is None:
                raise ValueError(
                    "scheduled_time is required for scheduled posts"
                )

            if scheduled_time <= datetime.now(
                dt_timezone.utc
            ):
                raise ValueError(
                    "scheduled_time must be in the future"
                )

            if not data.social_account_ids:
                raise ValueError(
                    "At least one social account is required for scheduled posts"
                )

            post_status = Status.SCHEDULED

        new_post = Post(
            user_id=post_owner_id,
            campaign_id=data.campaign_id,
            content=data.content,
            media_url=data.media_url,
            media_type=data.media_type,
            scheduled_time=scheduled_time,
            timezone=timezone_name,
            status=post_status,
        )

        db.add(new_post)

        db.flush()

        if data.social_account_ids:

            _attach_platforms(
                db,
                new_post,
                data.social_account_ids,
            )

        db.commit()

        db.refresh(
            new_post
        )

        # Force relationship loading while session is open.
        social_accounts = _load_social_accounts(
            new_post
        )

        response = _serialize_post(
            new_post
        )

        response[
            "social_accounts"
        ] = social_accounts

        return response

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# ALLOWED USER IDS
# =========================================================

def _get_allowed_user_ids(
    db,
    target_id: int,
):
    user = (
        db.query(User)
        .filter(
            User.id == target_id
        )
        .first()
    )

    if not user:
        return []

    role = (
        user.role.value
        if hasattr(
            user.role,
            "value",
        )
        else str(user.role)
    )

    if role == Role.MARKETING_TEAM.value:

        assignments = (
            db.query(
                BusinessAssignment
            )
            .filter(
                BusinessAssignment.marketing_team_id
                == target_id
            )
            .all()
        )

        return [
            assignment.business_user_id
            for assignment in assignments
        ]

    return [target_id]


# =========================================================
# LIST POSTS
# =========================================================

def list_posts(
    user_id: int,
    status: str | None = None,
):
    db = SessionLocal()

    try:

        allowed_ids = _get_allowed_user_ids(
            db,
            user_id,
        )

        query = (
            db.query(Post)
            .filter(
                Post.user_id.in_(
                    allowed_ids
                )
            )
        )

        if status:

            query = query.filter(
                Post.status == status
            )

        posts = (
            query
            .order_by(
                Post.scheduled_time
                .asc()
                .nulls_last()
            )
            .all()
        )

        return [
            _serialize_post(post)
            for post in posts
        ]

    finally:

        db.close()


# =========================================================
# GET POST
# =========================================================

def get_post(
    user_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id == user_id,
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        return _serialize_post(
            post
        )

    finally:

        db.close()


# =========================================================
# GET POST - MARKETING TEAM
# =========================================================

def get_post_for_marketing_team(
    marketing_team_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        allowed_ids = _get_allowed_user_ids(
            db,
            marketing_team_id,
        )

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id.in_(
                    allowed_ids
                ),
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        return _serialize_post(
            post
        )

    finally:

        db.close()


# =========================================================
# UPDATE POST
# =========================================================

def update_post(
    user_id: int,
    post_id: int,
    data,
):
    db = SessionLocal()

    try:

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id == user_id,
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        return _update_post_record(
            db,
            post,
            data,
        )

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# UPDATE POST - MARKETING TEAM
# =========================================================

def update_post_for_marketing_team(
    marketing_team_id: int,
    post_id: int,
    data,
):
    db = SessionLocal()

    try:

        allowed_ids = _get_allowed_user_ids(
            db,
            marketing_team_id,
        )

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id.in_(
                    allowed_ids
                ),
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        return _update_post_record(
            db,
            post,
            data,
        )

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# UPDATE POST RECORD
# =========================================================

def _update_post_record(
    db,
    post: Post,
    data,
):
    update_data = data.model_dump(
        exclude_unset=True,
        exclude={
            "social_account_ids"
        },
    )

    timezone_name = (
        update_data.get(
            "timezone"
        )
        or post.timezone
        or DEFAULT_TIMEZONE
    )

    if "scheduled_time" in update_data:

        scheduled_time = (
            update_data[
                "scheduled_time"
            ]
        )

        if scheduled_time is not None:

            scheduled_time = (
                _convert_to_utc(
                    scheduled_time,
                    timezone_name,
                )
            )

            if scheduled_time <= datetime.now(
                dt_timezone.utc
            ):
                raise ValueError(
                    "scheduled_time must be in the future"
                )

            update_data[
                "scheduled_time"
            ] = scheduled_time

            post.status = (
                Status.SCHEDULED
            )

    if "timezone" in update_data:

        update_data[
            "timezone"
        ] = timezone_name

    for field, value in update_data.items():

        setattr(
            post,
            field,
            value,
        )

    if (
        data.social_account_ids
        is not None
    ):

        if not data.social_account_ids:

            raise ValueError(
                "At least one social account is required"
            )

        _attach_platforms(
            db,
            post,
            data.social_account_ids,
        )

    post.updated_at = datetime.now(
        dt_timezone.utc
    )

    db.commit()

    db.refresh(
        post
    )

    return _serialize_post(
        post
    )


# =========================================================
# CANCEL POST
# =========================================================

def cancel_post(
    user_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id == user_id,
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        _cancel_post_record(
            db,
            post,
        )

        return _serialize_post(
            post
        )

    finally:

        db.close()


# =========================================================
# CANCEL POST - MARKETING TEAM
# =========================================================

def cancel_post_for_marketing_team(
    marketing_team_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        allowed_ids = _get_allowed_user_ids(
            db,
            marketing_team_id,
        )

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id.in_(
                    allowed_ids
                ),
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        _cancel_post_record(
            db,
            post,
        )

        return _serialize_post(
            post
        )

    finally:

        db.close()


def _cancel_post_record(
    db,
    post: Post,
):
    if post.status != Status.SCHEDULED:

        raise ValueError(
            "Only scheduled posts can be cancelled. "
            f"Current status: {post.status.value}"
        )

    post.status = Status.CANCELLED

    db.commit()

    db.refresh(
        post
    )


# =========================================================
# DELETE POST
# =========================================================

def delete_post(
    user_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id == user_id,
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        db.delete(
            post
        )

        db.commit()

        return {
            "message": f"Post {post_id} deleted"
        }

    finally:

        db.close()


# =========================================================
# DELETE POST - MARKETING TEAM
# =========================================================

def delete_post_for_marketing_team(
    marketing_team_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:

        allowed_ids = _get_allowed_user_ids(
            db,
            marketing_team_id,
        )

        post = (
            db.query(Post)
            .filter(
                Post.id == post_id,
                Post.user_id.in_(
                    allowed_ids
                ),
            )
            .first()
        )

        if not post:
            raise PostNotFoundException(
                post_id
            )

        db.delete(
            post
        )

        db.commit()

        return {
            "message": f"Post {post_id} deleted"
        }

    finally:

        db.close()


# =========================================================
# CALENDAR
# =========================================================

def get_calendar(
    user_id: int,
):
    db = SessionLocal()

    try:

        allowed_ids = _get_allowed_user_ids(
            db,
            user_id,
        )

        posts = (
            db.query(Post)
            .filter(
                Post.user_id.in_(
                    allowed_ids
                ),
                Post.status.in_(
                    [
                        Status.SCHEDULED,
                        Status.PUBLISHED,
                        Status.FAILED,
                        Status.CANCELLED,
                    ]
                ),
            )
            .order_by(
                Post.scheduled_time
                .asc()
                .nulls_last()
            )
            .all()
        )

        return [
            _serialize_post(post)
            for post in posts
        ]

    finally:

        db.close()


# =========================================================
# QUEUE
# =========================================================

def get_queue(
    user_id: int,
):
    db = SessionLocal()

    try:

        allowed_ids = _get_allowed_user_ids(
            db,
            user_id,
        )

        posts = (
            db.query(Post)
            .filter(
                Post.user_id.in_(
                    allowed_ids
                ),
                Post.status.in_(
                    [
                        Status.SCHEDULED,
                        Status.DRAFT,
                    ]
                ),
            )
            .order_by(
                Post.scheduled_time
                .asc()
                .nulls_last()
            )
            .all()
        )

        return [
            _serialize_post(post)
            for post in posts
        ]

    finally:

        db.close()