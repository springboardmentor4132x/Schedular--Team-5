import os
import uuid
import asyncio
import logging

from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
)

from supabase import create_client, Client

from api.auth.auth import get_current_user
from api.roles.social_account import Platform


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(__name__)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"],
)


# ============================================================
# SUPABASE CONFIGURATION
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
)

SUPABASE_BUCKET = os.getenv(
    "SUPABASE_STORAGE_BUCKET",
    "media",
)


if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is not configured."
    )


if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "SUPABASE_SERVICE_ROLE_KEY is not configured."
    )


SUPABASE_URL = SUPABASE_URL.rstrip("/")


# ============================================================
# CREATE SUPABASE CLIENT
# ============================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
)


logger.info(
    "Supabase Storage configured. Bucket=%s",
    SUPABASE_BUCKET,
)


# ============================================================
# ALLOWED FILE TYPES
# ============================================================

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
}


# ============================================================
# IMAGE SIZE LIMIT
#
# Application-level limit.
# ============================================================

MAX_IMAGE_SIZE_BYTES = (
    50 * 1024 * 1024
)


# ============================================================
# VIDEO SIZE LIMITS BY PLATFORM
#
# IMPORTANT:
#
# Supabase Free plan currently has a 50 MB global file limit.
# Therefore, even though social platforms support much larger
# videos, this backend cannot store a video larger than the
# Supabase project's storage limit.
#
# We therefore keep the application limits at 50 MB so that
# the user receives a clear error before Supabase rejects it.
# ============================================================

MAX_SUPABASE_FILE_SIZE_BYTES = (
    50 * 1024 * 1024
)


VIDEO_LIMITS = {
    Platform.INSTAGRAM: {
        "max_size_bytes": MAX_SUPABASE_FILE_SIZE_BYTES,
    },

    Platform.FACEBOOK: {
        "max_size_bytes": MAX_SUPABASE_FILE_SIZE_BYTES,
    },

    Platform.YOUTUBE: {
        "max_size_bytes": MAX_SUPABASE_FILE_SIZE_BYTES,
    },

    Platform.LINKEDIN: {
        "max_size_bytes": MAX_SUPABASE_FILE_SIZE_BYTES,
    },
}


# ============================================================
# GET USER ID
# ============================================================

def get_user_id(current_user):
    """
    Extract authenticated user ID.

    get_current_user() may return either:

        - a dictionary containing id/user_id
        - an object containing id/user_id
    """

    if isinstance(
        current_user,
        dict,
    ):

        return (
            current_user.get("id")
            or current_user.get("user_id")
        )

    user_id = getattr(
        current_user,
        "id",
        None,
    )

    if user_id is None:

        user_id = getattr(
            current_user,
            "user_id",
            None,
        )

    return user_id


# ============================================================
# GET VIDEO SIZE LIMIT
# ============================================================

def get_video_max_size(
    platform: Platform,
) -> int:

    """
    Return maximum allowed video size
    for the selected platform.

    The Supabase project currently has a
    50 MB storage limit, so this is also
    the effective maximum.
    """

    limits = VIDEO_LIMITS.get(
        platform
    )

    if not limits:

        raise HTTPException(
            status_code=400,
            detail=(
                "Video uploads are not currently "
                f"supported for {platform.value}."
            ),
        )

    return limits[
        "max_size_bytes"
    ]


# ============================================================
# FORMAT FILE SIZE
# ============================================================

def format_size(
    size_bytes: int,
) -> str:

    if size_bytes >= 1024 ** 3:

        size_gb = (
            size_bytes / (1024 ** 3)
        )

        return f"{size_gb:.2f} GB"

    if size_bytes >= 1024 ** 2:

        size_mb = (
            size_bytes / (1024 ** 2)
        )

        return f"{size_mb:.2f} MB"

    if size_bytes >= 1024:

        size_kb = (
            size_bytes / 1024
        )

        return f"{size_kb:.2f} KB"

    return f"{size_bytes} bytes"


# ============================================================
# UPLOAD TO SUPABASE
# ============================================================

def upload_to_supabase(
    storage_path: str,
    contents: bytes,
    content_type: str,
):

    """
    Upload using the normal Supabase Storage Python SDK.

    We intentionally do NOT use TUS here.

    The previous TUS implementation was returning:

        HTTP 400:
        Invalid upload-metadata

    This method uses the officially supported Python
    Storage upload API.
    """

    logger.info(
        "SUPABASE CLIENT UPLOAD START: "
        "path=%s size=%s content_type=%s",
        storage_path,
        format_size(len(contents)),
        content_type,
    )

    bucket = supabase.storage.from_(
        SUPABASE_BUCKET
    )

    result = bucket.upload(
        storage_path,
        contents,
        file_options={
            "content-type": content_type,
            "cache-control": "3600",
            "upsert": "false",
        },
    )

    logger.info(
        "SUPABASE CLIENT UPLOAD RESPONSE: %s",
        result,
    )

    return result


# ============================================================
# UPLOAD MEDIA
# ============================================================

@router.post("/")
async def upload_media(

    file: UploadFile = File(...),

    platform: Platform | None = Query(
        None,
        description=(
            "Optional social platform. "
            "Required for video uploads."
        ),
    ),

    current_user=Depends(
        get_current_user
    ),

):

    # ========================================================
    # 1. AUTHENTICATION
    # ========================================================

    user_id = get_user_id(
        current_user
    )

    if user_id is None:

        raise HTTPException(
            status_code=401,
            detail=(
                "Authenticated user ID is not "
                "available in the access token."
            ),
        )

    logger.info(
        "UPLOAD START: "
        "user_id=%s platform=%s "
        "filename=%s content_type=%s",
        user_id,
        platform.value if platform else None,
        file.filename,
        file.content_type,
    )

    # ========================================================
    # 2. VALIDATE CONTENT TYPE
    # ========================================================

    if not file.content_type:

        raise HTTPException(
            status_code=400,
            detail=(
                "File type could not be detected."
            ),
        )

    if (
        file.content_type
        not in ALLOWED_IMAGE_TYPES
        and
        file.content_type
        not in ALLOWED_VIDEO_TYPES
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Only image and video files are allowed."
            ),
        )

    # ========================================================
    # 3. VALIDATE FILENAME
    # ========================================================

    original_filename = (
        file.filename or ""
    )

    if not original_filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is missing.",
        )

    # ========================================================
    # 4. FILE EXTENSION
    # ========================================================

    file_extension = os.path.splitext(
        original_filename
    )[1].lower()

    if not file_extension:

        raise HTTPException(
            status_code=400,
            detail=(
                "File extension could not be detected."
            ),
        )

    # ========================================================
    # 5. READ FILE
    # ========================================================

    logger.info(
        "UPLOAD READING FILE: %s",
        original_filename,
    )

    contents = await file.read()

    if not contents:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    # ========================================================
    # 6. FILE SIZE
    # ========================================================

    file_size_bytes = len(
        contents
    )

    logger.info(
        "UPLOAD FILE SIZE: %s",
        format_size(file_size_bytes),
    )

    # ========================================================
    # 7. IMAGE VALIDATION
    # ========================================================

    if file.content_type in ALLOWED_IMAGE_TYPES:

        if (
            file_size_bytes
            > MAX_IMAGE_SIZE_BYTES
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Image size cannot exceed "
                    "50 MB. "
                    f"Uploaded file size is "
                    f"{format_size(file_size_bytes)}."
                ),
            )

    # ========================================================
    # 8. VIDEO VALIDATION
    # ========================================================

    elif file.content_type in ALLOWED_VIDEO_TYPES:

        # ----------------------------------------------------
        # Platform is mandatory for video.
        # ----------------------------------------------------

        if platform is None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Platform is required for video uploads."
                ),
            )

        # ----------------------------------------------------
        # Get effective video limit.
        # ----------------------------------------------------

        max_video_size_bytes = (
            get_video_max_size(
                platform
            )
        )

        # ----------------------------------------------------
        # Reject anything larger than Supabase's
        # current 50 MB project limit.
        # ----------------------------------------------------

        if (
            file_size_bytes
            > max_video_size_bytes
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Video is too large for "
                    f"the current Supabase Storage limit. "
                    f"Maximum allowed size is "
                    f"{format_size(max_video_size_bytes)}. "
                    f"Uploaded file size is "
                    f"{format_size(file_size_bytes)}."
                ),
            )

    # ========================================================
    # 9. CREATE UNIQUE FILENAME
    # ========================================================

    unique_filename = (
        f"{uuid.uuid4().hex}"
        f"{file_extension}"
    )

    # ========================================================
    # 10. STORAGE PATH
    # ========================================================

    storage_path = (
        f"{user_id}/"
        f"{unique_filename}"
    )

    logger.info(
        "UPLOAD STORAGE PATH: %s",
        storage_path,
    )

    # ========================================================
    # 11. UPLOAD TO SUPABASE
    # ========================================================

    try:

        logger.info(
            "SUPABASE UPLOAD START: "
            "file=%s size=%s",
            storage_path,
            format_size(file_size_bytes),
        )

        # ----------------------------------------------------
        # Run blocking Supabase SDK call in a worker thread
        # so FastAPI's event loop is not blocked.
        # ----------------------------------------------------

        await asyncio.to_thread(
            upload_to_supabase,
            storage_path,
            contents,
            file.content_type,
        )

        logger.info(
            "SUPABASE UPLOAD SUCCESS: %s",
            storage_path,
        )

    except Exception as exc:

        logger.exception(
            "SUPABASE UPLOAD FAILED: "
            "file=%s size=%s",
            storage_path,
            format_size(file_size_bytes),
        )

        error_message = str(exc)

        # ----------------------------------------------------
        # Provide a clearer message for Supabase's
        # file-size restriction.
        # ----------------------------------------------------

        if (
            "EntityTooLarge"
            in error_message
            or
            "413"
            in error_message
            or
            "maximum file size"
            in error_message.lower()
            or
            "file size"
            in error_message.lower()
        ):

            raise HTTPException(
                status_code=413,
                detail=(
                    "Supabase Storage rejected the file "
                    "because it exceeds the project's "
                    "maximum file size. "
                    "The current project limit is 50 MB."
                ),
            )

        # ----------------------------------------------------
        # Generic upload failure.
        # ----------------------------------------------------

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to upload media to "
                "Supabase Storage: "
                f"{error_message}"
            ),
        )

    # ========================================================
    # 12. BUILD PUBLIC URL
    # ========================================================

    media_url = (
        f"{SUPABASE_URL}"
        f"/storage/v1/object/public/"
        f"{SUPABASE_BUCKET}/"
        f"{storage_path}"
    )

    # ========================================================
    # 13. DETERMINE MEDIA TYPE
    # ========================================================

    media_type = (
        "video"
        if file.content_type
        in ALLOWED_VIDEO_TYPES
        else "image"
    )

    # ========================================================
    # 14. FINAL RESPONSE
    # ========================================================

    logger.info(
        "UPLOAD FINISHED: "
        "user_id=%s platform=%s "
        "media_type=%s size=%s",
        user_id,
        platform.value
        if platform
        else None,
        media_type,
        format_size(file_size_bytes),
    )

    return {
        "filename": unique_filename,
        "media_url": media_url,
        "media_type": media_type,
        "platform": (
            platform.value
            if platform
            else None
        ),
        "file_size_bytes": file_size_bytes,
    }