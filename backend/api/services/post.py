import httpx
from datetime import datetime, timezone as dt_timezone
from zoneinfo import ZoneInfo
from api.database.session import SessionLocal
from api.exceptions.post import PostNotFoundException
from api.models.business_assignment import BusinessAssignment
from api.models.post import Post
from api.models.post_social_account import PostSocialAccount
from api.models.social_account import SocialAccount
from api.models.user import User
from api.roles.notification import NotificationType
from api.roles.post import Status
from api.roles.post_social_account import PublishStatus
from api.roles.user import Role
from api.services.notification import (
    create_post_activity_notifications,
)


DEFAULT_TIMEZONE = "Asia/Kolkata"

FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v25.0"
INSTAGRAM_GRAPH_URL = "https://graph.facebook.com/v25.0"


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


def _validate_social_accounts(
    db,
    social_account_ids: list[int],
):
    if not social_account_ids:
        return

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


def _load_social_accounts(
    post: Post,
):
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


def _serialize_post(
    post: Post,
):
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


def create_post(
    user_id: int,
    data,
    current_user_role: str,
):
    db = SessionLocal()

    try:
        # =========================================================
        # RESOLVE POST OWNER
        # =========================================================

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

        # =========================================================
        # TIMEZONE
        # =========================================================

        timezone_name = (
            data.timezone
            or DEFAULT_TIMEZONE
        )

        scheduled_time = _convert_to_utc(
            data.scheduled_time,
            timezone_name,
        )

        # =========================================================
        # POST STATUS
        # =========================================================

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

        # =========================================================
        # CREATE POST
        # =========================================================

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

        # =========================================================
        # ATTACH SOCIAL ACCOUNTS
        # =========================================================

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

        # =========================================================
        # MODULE 7 - POST SCHEDULED NOTIFICATION
        # =========================================================

        if post_status == Status.SCHEDULED:

            print(
                "=================================================",
                flush=True,
            )

            print(
                ">>> CREATING POST SCHEDULED NOTIFICATION",
                flush=True,
            )

            print(
                f">>> POST OWNER ID: {post_owner_id}",
                flush=True,
            )

            print(
                f">>> POST ID: {new_post.id}",
                flush=True,
            )

            try:
                notifications = (
                    create_post_activity_notifications(
                        post_owner_id=post_owner_id,
                        title="Post Scheduled",
                        description=(
                            f"Post {new_post.id} "
                            "has been successfully scheduled."
                        ),
                        notification_type=(
                            NotificationType.SUCCESS
                        ),
                        related_post_id=new_post.id,
                        related_campaign_id=(
                            new_post.campaign_id
                        ),
                    )
                )

                print(
                    ">>> POST SCHEDULED NOTIFICATION CREATED",
                    flush=True,
                )

                print(
                    f">>> NOTIFICATION COUNT: "
                    f"{len(notifications)}",
                    flush=True,
                )

            except Exception as notification_error:

                print(
                    ">>> POST SCHEDULED NOTIFICATION CREATION FAILED",
                    flush=True,
                )

                print(
                    f">>> NOTIFICATION ERROR: "
                    f"{notification_error}",
                    flush=True,
                )

                # Notification failure must not
                # break successful post creation.

            print(
                "=================================================",
                flush=True,
            )

        # =========================================================
        # RETURN CREATED POST
        # =========================================================

        return _serialize_post(
            new_post
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


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

        scheduled_time = update_data[
            "scheduled_time"
        ]

        if scheduled_time is not None:

            scheduled_time = _convert_to_utc(
                scheduled_time,
                timezone_name,
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

            post.status = Status.SCHEDULED

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

    if data.social_account_ids is not None:

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


def _get_platform_value(
    platform,
):
    if hasattr(
        platform,
        "value",
    ):
        return str(
            platform.value
        ).lower()

    return str(
        platform
    ).lower()


def _delete_facebook_post(
    access_token: str,
    platform_post_id: str,
):
    if not access_token:
        raise ValueError(
            "Facebook access token is missing."
        )

    if not platform_post_id:
        raise ValueError(
            "Facebook platform post ID is missing."
        )

    endpoint = (
        f"{FACEBOOK_GRAPH_URL}/"
        f"{platform_post_id}"
    )

    print(
        ">>> FACEBOOK DELETE STARTED",
        flush=True,
    )

    print(
        f">>> FACEBOOK POST ID: {platform_post_id}",
        flush=True,
    )

    try:
        with httpx.Client(
            timeout=60.0
        ) as client:

            response = client.delete(
                endpoint,
                params={
                    "access_token": access_token,
                },
            )

    except httpx.RequestError as exc:

        raise Exception(
            "Facebook delete request failed: "
            f"{exc}"
        ) from exc

    print(
        ">>> FACEBOOK DELETE STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> FACEBOOK DELETE RESPONSE:",
        response.text,
        flush=True,
    )

    if response.status_code >= 400:

        try:
            error_data = response.json()

        except Exception:
            error_data = response.text

        raise Exception(
            "Facebook post deletion failed. "
            f"HTTP {response.status_code}. "
            f"Response: {error_data}"
        )

    print(
        ">>> FACEBOOK POST DELETED SUCCESSFULLY",
        flush=True,
    )

    return True


def _delete_instagram_post(
    access_token: str,
    platform_post_id: str,
):
    if not access_token:
        raise ValueError(
            "Instagram access token is missing."
        )

    if not platform_post_id:
        raise ValueError(
            "Instagram media ID is missing."
        )

    endpoint = (
        f"{INSTAGRAM_GRAPH_URL}/"
        f"{platform_post_id}"
    )

    print(
        ">>> INSTAGRAM DELETE STARTED",
        flush=True,
    )

    print(
        f">>> INSTAGRAM MEDIA ID: {platform_post_id}",
        flush=True,
    )

    try:
        with httpx.Client(
            timeout=60.0
        ) as client:

            response = client.delete(
                endpoint,
                params={
                    "access_token": access_token,
                },
            )

    except httpx.RequestError as exc:

        raise Exception(
            "Instagram delete request failed: "
            f"{exc}"
        ) from exc

    print(
        ">>> INSTAGRAM DELETE STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> INSTAGRAM DELETE RESPONSE:",
        response.text,
        flush=True,
    )

    if response.status_code >= 400:

        try:
            error_data = response.json()

        except Exception:
            error_data = {
                "raw_response": response.text
            }

        error_object = (
            error_data.get(
                "error",
                {}
            )
            if isinstance(
                error_data,
                dict
            )
            else {}
        )

        error_code = error_object.get(
            "code"
        )

        error_subcode = error_object.get(
            "error_subcode"
        )

        error_message = error_object.get(
            "message",
            response.text,
        )

        if (
            error_code == 10
            or error_subcode == 33
        ):
            raise Exception(
                "Instagram deletion failed because "
                "the Instagram access token does not "
                "have permission to access this media. "
                f"Media ID: {platform_post_id}. "
                f"Meta response: {error_message}"
            )

        raise Exception(
            "Instagram post deletion failed. "
            f"HTTP {response.status_code}. "
            f"Response: {error_data}"
        )

    print(
        ">>> INSTAGRAM POST DELETED SUCCESSFULLY",
        flush=True,
    )

    return True


def _delete_platform_post(
    account: SocialAccount,
    platform_post_id: str,
):
    platform = _get_platform_value(
        account.platform
    )

    access_token = account.access_token

    if platform == "facebook":

        return _delete_facebook_post(
            access_token=access_token,
            platform_post_id=platform_post_id,
        )

    if platform == "instagram":

        return _delete_instagram_post(
            access_token=access_token,
            platform_post_id=platform_post_id,
        )

    raise ValueError(
        f"Remote deletion is not implemented yet "
        f"for platform: {platform}"
    )


def _delete_published_platform_posts(
    db,
    post: Post,
):
    relations = (
        db.query(PostSocialAccount)
        .filter(
            PostSocialAccount.post_id == post.id
        )
        .all()
    )

    if not relations:
        return

    deletion_errors = []

    for relation in relations:

        platform_post_id = (
            relation.platform_post_id
        )

        if not platform_post_id:

            print(
                ">>> NO PLATFORM POST ID - "
                "SKIPPING REMOTE DELETE",
                flush=True,
            )

            continue

        account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.id
                == relation.social_account_id
            )
            .first()
        )

        if not account:

            deletion_errors.append(
                f"Social account "
                f"{relation.social_account_id} "
                f"was not found."
            )

            continue

        platform = _get_platform_value(
            account.platform
        )

        print(
            ">>> PREPARING REMOTE POST DELETE",
            flush=True,
        )

        print(
            f">>> PLATFORM: {platform}",
            flush=True,
        )

        print(
            f">>> SOCIAL ACCOUNT ID: {account.id}",
            flush=True,
        )

        print(
            f">>> PLATFORM POST ID: {platform_post_id}",
            flush=True,
        )

        try:

            _delete_platform_post(
                account,
                platform_post_id,
            )

        except Exception as exc:

            error_message = (
                f"{platform} deletion failed "
                f"for platform post "
                f"{platform_post_id}: "
                f"{exc}"
            )

            print(
                f">>> {error_message}",
                flush=True,
            )

            deletion_errors.append(
                error_message
            )

    if deletion_errors:

        raise Exception(
            "One or more social platform "
            "deletions failed. "
            + " | ".join(
                deletion_errors
            )
        )


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

        print(
            "=================================================",
            flush=True,
        )

        print(
            f">>> DELETE POST REQUESTED: {post_id}",
            flush=True,
        )

        print(
            f">>> LOCAL POST STATUS: {post.status}",
            flush=True,
        )

        _delete_published_platform_posts(
            db,
            post,
        )

        db.delete(
            post
        )

        db.commit()

        print(
            f">>> SOCIALPILOT POST {post_id} "
            "DELETED SUCCESSFULLY",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return {
            "message": f"Post {post_id} deleted"
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


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

        print(
            "=================================================",
            flush=True,
        )

        print(
            f">>> MARKETING TEAM DELETE REQUESTED: {post_id}",
            flush=True,
        )

        print(
            f">>> LOCAL POST STATUS: {post.status}",
            flush=True,
        )

        _delete_published_platform_posts(
            db,
            post,
        )

        db.delete(
            post
        )

        db.commit()

        print(
            f">>> SOCIALPILOT POST {post_id} "
            "DELETED SUCCESSFULLY",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return {
            "message": f"Post {post_id} deleted"
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def _delete_post_from_specific_social_account(
    db,
    post: Post,
    social_account_id: int,
):
    relation = (
        db.query(PostSocialAccount)
        .filter(
            PostSocialAccount.post_id == post.id,
            PostSocialAccount.social_account_id
            == social_account_id,
        )
        .first()
    )

    if not relation:
        raise ValueError(
            "This social account is not connected to the post"
        )

    account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.id == social_account_id
        )
        .first()
    )

    if not account:
        raise ValueError(
            "Social account not found"
        )

    platform_post_id = (
        relation.platform_post_id
    )

    platform = _get_platform_value(
        account.platform
    )

    print(
        "=================================================",
        flush=True,
    )

    print(
        ">>> SPECIFIC PLATFORM DELETE REQUESTED",
        flush=True,
    )

    print(
        f">>> POST ID: {post.id}",
        flush=True,
    )

    print(
        f">>> SOCIAL ACCOUNT ID: {social_account_id}",
        flush=True,
    )

    print(
        f">>> PLATFORM: {platform}",
        flush=True,
    )

    print(
        f">>> PLATFORM POST ID: {platform_post_id}",
        flush=True,
    )

    if not platform_post_id:

        db.delete(
            relation
        )

        db.commit()

        print(
            ">>> NO REMOTE PLATFORM POST EXISTS",
            flush=True,
        )

        print(
            ">>> LOCAL SOCIAL ACCOUNT RELATION REMOVED",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return {
            "message": (
                f"Post {post.id} was not published "
                f"on {platform}; social account removed "
                "from this post"
            )
        }

    _delete_platform_post(
        account,
        platform_post_id,
    )

    db.delete(
        relation
    )

    db.commit()

    print(
        f">>> POST {post.id} DELETED FROM "
        f"{platform} ACCOUNT {social_account_id}",
        flush=True,
    )

    print(
        "=================================================",
        flush=True,
    )

    return {
        "message": (
            f"Post {post.id} deleted from "
            f"{platform} social account "
            f"{social_account_id}"
        )
    }


def delete_post_from_social_account(
    user_id: int,
    post_id: int,
    social_account_id: int,
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

        return _delete_post_from_specific_social_account(
            db,
            post,
            social_account_id,
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def delete_post_from_social_account_for_marketing_team(
    marketing_team_id: int,
    post_id: int,
    social_account_id: int,
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

        return _delete_post_from_specific_social_account(
            db,
            post,
            social_account_id,
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_calendar(
    user_id: int,
    client_id: int | None = None,
):
    db = SessionLocal()

    try:

        if client_id is not None:
            allowed_ids = [client_id]

        else:
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


def get_queue(
    user_id: int,
    client_id: int | None = None,
):
    db = SessionLocal()

    try:

        if client_id is not None:
            allowed_ids = [client_id]

        else:
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