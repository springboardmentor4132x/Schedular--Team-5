
from fastapi import APIRouter, Depends, HTTPException, status

from api.auth.auth import get_current_user
from api.database.session import SessionLocal
from api.services import content_workflow


router = APIRouter(
    prefix="/content-workflow",
    tags=["Content Workflow"],
)


def _get_current_user_id(
    current_user: dict,
) -> int:
    """
    Extract the authenticated user's ID from the JWT.
    """

    user_id = current_user.get("id")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Authenticated user ID is not available "
                "in the access token."
            ),
        )

    try:
        return int(user_id)

    except (TypeError, ValueError):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user ID.",
        )


def _get_current_user_role(
    current_user: dict,
) -> str:
    """
    Extract and normalize the authenticated user's role.
    """

    role = current_user.get(
        "role"
    )

    if hasattr(
        role,
        "value",
    ):
        role = role.value

    return str(
        role
    ).strip().lower()


# =========================================================
# SUBMIT FOR REVIEW
# =========================================================

@router.post(
    "/{post_id}/submit-review",
)
def submit_post_for_review(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    """
    Submit a draft post for content review.

    Workflow:

        draft
          ↓
        pending_approval
    """

    db = SessionLocal()

    try:

        user_id = _get_current_user_id(
            current_user
        )

        user_role = _get_current_user_role(
            current_user
        )

        post = content_workflow.submit_for_review(
            db=db,
            post_id=post_id,
            user_id=user_id,
            user_role=user_role,
        )

        return {
            "message": (
                f"Post {post.id} "
                "submitted for review successfully."
            ),
            "post_id": post.id,
            "status": (
                post.status.value
                if hasattr(
                    post.status,
                    "value",
                )
                else str(
                    post.status
                )
            ),
        }

    except content_workflow.ContentNotFoundError as exc:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except content_workflow.WorkflowAuthorizationError as exc:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except content_workflow.InvalidWorkflowStateError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    finally:

        db.close()


# =========================================================
# APPROVE CONTENT
# =========================================================

@router.post(
    "/{post_id}/approve",
)
def approve_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    """
    Approve content waiting for review.

    Workflow:

        pending_approval
              ↓
           scheduled
    """

    db = SessionLocal()

    try:

        user_id = _get_current_user_id(
            current_user
        )

        user_role = _get_current_user_role(
            current_user
        )

        post = content_workflow.approve_content(
            db=db,
            post_id=post_id,
            user_id=user_id,
            user_role=user_role,
        )

        return {
            "message": (
                f"Post {post.id} "
                "approved successfully."
            ),
            "post_id": post.id,
            "status": (
                post.status.value
                if hasattr(
                    post.status,
                    "value",
                )
                else str(
                    post.status
                )
            ),
        }

    except content_workflow.ContentNotFoundError as exc:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except content_workflow.WorkflowAuthorizationError as exc:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except content_workflow.InvalidWorkflowStateError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    finally:

        db.close()


# =========================================================
# REJECT CONTENT
# =========================================================

@router.post(
    "/{post_id}/reject",
)
def reject_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    """
    Reject content waiting for review.

    Workflow:

        pending_approval
              ↓
             draft
    """

    db = SessionLocal()

    try:

        user_id = _get_current_user_id(
            current_user
        )

        user_role = _get_current_user_role(
            current_user
        )

        post = content_workflow.reject_content(
            db=db,
            post_id=post_id,
            user_id=user_id,
            user_role=user_role,
        )

        return {
            "message": (
                f"Post {post.id} "
                "rejected successfully."
            ),
            "post_id": post.id,
            "status": (
                post.status.value
                if hasattr(
                    post.status,
                    "value",
                )
                else str(
                    post.status
                )
            ),
        }

    except content_workflow.ContentNotFoundError as exc:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except content_workflow.WorkflowAuthorizationError as exc:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except content_workflow.InvalidWorkflowStateError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    finally:

        db.close()
