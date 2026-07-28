import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from api.auth.auth import get_current_user


router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"],
)


UPLOAD_DIR = "uploads"


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


@router.post("/")
async def upload_media(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if not file.content_type:
        raise HTTPException(
            status_code=400,
            detail="File type could not be detected.",
        )

    if (
        file.content_type not in ALLOWED_IMAGE_TYPES
        and file.content_type not in ALLOWED_VIDEO_TYPES
    ):
        raise HTTPException(
            status_code=400,
            detail="Only image and video files are allowed.",
        )

    file_extension = os.path.splitext(
        file.filename or ""
    )[1].lower()

    if not file_extension:
        raise HTTPException(
            status_code=400,
            detail="File extension could not be detected.",
        )

    os.makedirs(
        UPLOAD_DIR,
        exist_ok=True,
    )

    unique_filename = (
        f"{uuid.uuid4().hex}"
        f"{file_extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename,
    )

    contents = await file.read()

    max_file_size = 50 * 1024 * 1024

    if len(contents) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="File size cannot exceed 50MB.",
        )

    with open(
        file_path,
        "wb",
    ) as buffer:
        buffer.write(contents)

    return {
        "filename": unique_filename,
        "media_url": (
            f"http://127.0.0.1:8000/uploads/{unique_filename}"
        ),
        "media_type": (
            "video"
            if file.content_type in ALLOWED_VIDEO_TYPES
            else "image"
        ),
    }