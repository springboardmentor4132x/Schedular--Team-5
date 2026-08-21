
from api.database.session import SessionLocal
from api.models.team_activity import TeamActivity


def create_team_activity(
    user_id: int,
    activity_type: str,
    title: str,
    description: str,
    related_campaign_id: int | None = None,
    related_post_id: int | None = None,
):
    """
    Create a new Team Feed activity.

    Team activity failures should not be allowed to break
    the main application operation.
    """

    db = SessionLocal()

    try:
        activity = TeamActivity(
            user_id=user_id,
            activity_type=activity_type,
            title=title,
            description=description,
            related_campaign_id=related_campaign_id,
            related_post_id=related_post_id,
        )

        db.add(activity)
        db.commit()
        db.refresh(activity)

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> TEAM ACTIVITY CREATED",
            flush=True,
        )
        print(
            f">>> ACTIVITY ID: {activity.id}",
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
            f">>> TITLE: {title}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return activity

    except Exception as exc:
        db.rollback()

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> TEAM ACTIVITY CREATION FAILED",
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
            f">>> ERROR: {exc}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return None

    finally:
        db.close()


def list_team_activities(
    limit: int = 50,
    offset: int = 0,
):
    """
    Return Team Feed activities in newest-first order.
    """

    db = SessionLocal()

    try:
        activities = (
            db.query(TeamActivity)
            .order_by(
                TeamActivity.created_at.desc()
            )
            .offset(offset)
            .limit(limit)
            .all()
        )

        return activities

    finally:
        db.close()


def get_team_activity(
    activity_id: int,
):
    """
    Return one Team Feed activity by ID.
    """

    db = SessionLocal()

    try:
        return (
            db.query(TeamActivity)
            .filter(
                TeamActivity.id == activity_id
            )
            .first()
        )

    finally:
        db.close()
