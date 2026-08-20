
from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from api.models.business_assignment import BusinessAssignment
from api.models.post import Post
from api.models.user import User
from api.roles.post import Status
from api.roles.user import Role
from api.services.notification import (
    create_post_activity_notifications,
)


# =========================================================
# CONTENT WORKFLOW SERVICE
# =========================================================
#
# Workflow:
#
#     draft
#       ↓
# pending_approval
#       ↓
# scheduled
#
# OR
#
# pending_approval
#       ↓
# draft
#
# Supported operations:
#
# 1. Submit for Review
# 2. Approval
# 3. Rejection
# 4. Notifications
# 5. Role / ownership validation
#
# =========================================================


class ContentWorkflowError(Exception):
    """
    Base exception for content workflow errors.
    """

    pass


class ContentNotFoundError(ContentWorkflowError):
    """
    Raised when the requested post/content does not exist.
    """

    pass


class InvalidWorkflowStateError(ContentWorkflowError):
    """
    Raised when a workflow operation is attempted from
    an invalid content state.
    """

    pass


class WorkflowAuthorizationError(ContentWorkflowError):
    """
    Raised when the authenticated user is not authorized
    to operate on the requested post.
    """

    pass


# =========================================================
# ROLE NORMALIZATION
# =========================================================

def _normalize_role(
    role,
) -> str:
    """
    Convert a Role enum or string into a normalized
    lowercase string.
    """

    if hasattr(
        role,
        "value",
    ):
        role = role.value

    return str(
        role
    ).strip().lower()


# =========================================================
# GET CONTENT
# =========================================================

def get_content_for_workflow(
    db: Session,
    post_id: int,
) -> Post:
    """
    Retrieve a post that will be processed by the
    content workflow.

    This function only verifies that the post exists.

    Authorization is handled separately by
    validate_workflow_access().
    """

    post = (
        db.query(Post)
        .filter(
            Post.id == post_id
        )
        .first()
    )

    if post is None:
        raise ContentNotFoundError(
            f"Post with id {post_id} not found."
        )

    return post


# =========================================================
# GET CURRENT WORKFLOW STATUS
# =========================================================

def get_content_workflow_status(
    db: Session,
    post_id: int,
) -> Any:
    """
    Return the current workflow status of a post.
    """

    post = get_content_for_workflow(
        db=db,
        post_id=post_id,
    )

    return post.status


# =========================================================
# WORKFLOW STATUS VALIDATION
# =========================================================

def ensure_workflow_state(
    post: Post,
    allowed_states: set[str],
) -> None:
    """
    Verify that the post is currently in one of the
    allowed workflow states.
    """

    current_status = post.status

    if hasattr(
        current_status,
        "value",
    ):
        current_status = current_status.value

    current_status = str(
        current_status
    ).strip().lower()

    normalized_allowed_states = {
        str(state).strip().lower()
        for state in allowed_states
    }

    if (
        current_status
        not in normalized_allowed_states
    ):
        raise InvalidWorkflowStateError(
            (
                f"Post {post.id} is currently in "
                f"'{current_status}' state. "
                f"Allowed states are: "
                f"{sorted(normalized_allowed_states)}."
            )
        )


# =========================================================
# ROLE / OWNERSHIP VALIDATION
# =========================================================

def validate_workflow_access(
    db: Session,
    post: Post,
    user_id: int,
    user_role,
) -> None:
    """
    Validate whether a user is authorized to operate
    on a particular post.

    Rules:

    CONTENT CREATOR
        Can operate only on their own posts.

    BUSINESS USER
        Can operate only on their own posts.

    MARKETING TEAM
        Can operate on posts belonging to Business Users
        assigned to that Marketing Team.

    ADMINISTRATOR
        Can operate on any post.

    This function does not decide whether the particular
    operation is submit / approve / reject. It only checks
    ownership/access.
    """

    normalized_role = _normalize_role(
        user_role
    )

    # =====================================================
    # ADMINISTRATOR
    # =====================================================

    if normalized_role == Role.ADMINISTRATOR.value:

        return

    # =====================================================
    # CONTENT CREATOR
    # =====================================================

    if normalized_role == Role.CONTENT_CREATOR.value:

        if post.user_id != user_id:

            raise WorkflowAuthorizationError(
                (
                    "Content Creator is not authorized "
                    f"to operate on post {post.id}."
                )
            )

        return

    # =====================================================
    # BUSINESS USER
    # =====================================================

    if normalized_role == Role.BUSINESS_USER.value:

        if post.user_id != user_id:

            raise WorkflowAuthorizationError(
                (
                    "Business User is not authorized "
                    f"to operate on post {post.id}."
                )
            )

        return

    # =====================================================
    # MARKETING TEAM
    # =====================================================

    if normalized_role == Role.MARKETING_TEAM.value:

        assignment = (
            db.query(
                BusinessAssignment
            )
            .filter(
                BusinessAssignment.business_user_id
                == post.user_id,
                BusinessAssignment.marketing_team_id
                == user_id,
            )
            .first()
        )

        if assignment is None:

            raise WorkflowAuthorizationError(
                (
                    "Marketing Team user is not authorized "
                    f"to operate on post {post.id}. "
                    "The post owner is not assigned to "
                    "this Marketing Team."
                )
            )

        return

    # =====================================================
    # UNKNOWN ROLE
    # =====================================================

    raise WorkflowAuthorizationError(
        (
            f"Role '{normalized_role}' is not authorized "
            "to perform content workflow operations."
        )
    )


# =========================================================
# SAVE WORKFLOW CHANGE
# =========================================================

def save_workflow_change(
    db: Session,
    post: Post,
) -> Post:
    """
    Persist a workflow state change.
    """

    db.add(
        post
    )

    db.commit()

    db.refresh(
        post
    )

    return post


# =========================================================
# NOTIFICATION HELPER
# =========================================================

def _create_workflow_notification(
    post: Post,
    title: str,
    description: str,
) -> None:
    """
    Create a workflow notification for the post owner.

    Notification failures are intentionally isolated so
    that notification problems never break the workflow
    status change.
    """

    try:

        notification = (
            create_post_activity_notifications(
                post_owner_id=post.user_id,
                title=title,
                description=description,
                notification_type="success",
                related_post_id=post.id,
            )
        )

        if notification is not None:

            print(
                ">>> WORKFLOW NOTIFICATION CREATED",
                flush=True,
            )

            print(
                f">>> NOTIFICATION ID: "
                f"{notification.id}",
                flush=True,
            )

        else:

            print(
                ">>> WORKFLOW NOTIFICATION "
                "WAS BLOCKED BY USER PREFERENCE",
                flush=True,
            )

    except Exception as notification_error:

        print(
            ">>> WORKFLOW NOTIFICATION FAILED",
            flush=True,
        )

        print(
            f">>> NOTIFICATION ERROR: "
            f"{notification_error}",
            flush=True,
        )

        # Notification failure must never break
        # the workflow operation.


# =========================================================
# SUBMIT FOR REVIEW
# =========================================================

def submit_for_review(
    db: Session,
    post_id: int,
    user_id: int,
    user_role,
) -> Post:
    """
    Submit a draft post for review.

    Allowed transition:

        draft
          ↓
        pending_approval
    """

    post = get_content_for_workflow(
        db=db,
        post_id=post_id,
    )

    # -----------------------------------------------------
    # ROLE / OWNERSHIP VALIDATION
    # -----------------------------------------------------

    validate_workflow_access(
        db=db,
        post=post,
        user_id=user_id,
        user_role=user_role,
    )

    # -----------------------------------------------------
    # STATE VALIDATION
    # -----------------------------------------------------

    ensure_workflow_state(
        post=post,
        allowed_states={
            Status.DRAFT.value,
        },
    )

    # -----------------------------------------------------
    # STATUS CHANGE
    # -----------------------------------------------------

    post.status = Status.PENDING_APPROVAL

    post = save_workflow_change(
        db=db,
        post=post,
    )

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    _create_workflow_notification(
        post=post,
        title="Content Submitted for Review",
        description=(
            f"Post {post.id} "
            "has been submitted for review."
        ),
    )

    return post


# =========================================================
# APPROVE CONTENT
# =========================================================

def approve_content(
    db: Session,
    post_id: int,
    user_id: int,
    user_role,
) -> Post:
    """
    Approve content that is waiting for review.

    Allowed transition:

        pending_approval
              ↓
           scheduled
    """

    post = get_content_for_workflow(
        db=db,
        post_id=post_id,
    )

    # -----------------------------------------------------
    # ROLE / OWNERSHIP VALIDATION
    # -----------------------------------------------------

    validate_workflow_access(
        db=db,
        post=post,
        user_id=user_id,
        user_role=user_role,
    )

    # -----------------------------------------------------
    # STATE VALIDATION
    # -----------------------------------------------------

    ensure_workflow_state(
        post=post,
        allowed_states={
            Status.PENDING_APPROVAL.value,
        },
    )

    # -----------------------------------------------------
    # STATUS CHANGE
    # -----------------------------------------------------

    post.status = Status.SCHEDULED

    post = save_workflow_change(
        db=db,
        post=post,
    )

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    _create_workflow_notification(
        post=post,
        title="Content Approved",
        description=(
            f"Post {post.id} "
            "has been approved and is ready for scheduling."
        ),
    )

    return post


# =========================================================
# REJECT CONTENT
# =========================================================

def reject_content(
    db: Session,
    post_id: int,
    user_id: int,
    user_role,
) -> Post:
    """
    Reject content that is waiting for review.

    Allowed transition:

        pending_approval
              ↓
             draft
    """

    post = get_content_for_workflow(
        db=db,
        post_id=post_id,
    )

    # -----------------------------------------------------
    # ROLE / OWNERSHIP VALIDATION
    # -----------------------------------------------------

    validate_workflow_access(
        db=db,
        post=post,
        user_id=user_id,
        user_role=user_role,
    )

    # -----------------------------------------------------
    # STATE VALIDATION
    # -----------------------------------------------------

    ensure_workflow_state(
        post=post,
        allowed_states={
            Status.PENDING_APPROVAL.value,
        },
    )

    # -----------------------------------------------------
    # STATUS CHANGE
    # -----------------------------------------------------

    post.status = Status.DRAFT

    post = save_workflow_change(
        db=db,
        post=post,
    )

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    _create_workflow_notification(
        post=post,
        title="Content Rejected",
        description=(
            f"Post {post.id} "
            "has been rejected and returned to draft."
        ),
    )

    return post
