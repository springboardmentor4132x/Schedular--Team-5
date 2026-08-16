from api.roles.social_account import Platform


VIDEO_LIMITS = {
    Platform.INSTAGRAM: {
        "max_size_bytes": 1 * 1024 * 1024 * 1024,  # 1 GB
        "max_duration_seconds": 15 * 60,             # 15 minutes
    },

    Platform.FACEBOOK: {
        "max_size_bytes": 4 * 1024 * 1024 * 1024,  # 4 GB
        "max_duration_seconds": 240 * 60,            # 240 minutes
    },

    Platform.YOUTUBE: {
        "max_size_bytes": 256 * 1024 * 1024 * 1024,  # 256 GB
        "max_duration_seconds": 12 * 60 * 60,         # 12 hours
    },
}


def validate_video_size(
    file_size_bytes: int,
    platform: Platform,
):
    limits = VIDEO_LIMITS.get(platform)

    if not limits:
        return

    max_size = limits["max_size_bytes"]

    if file_size_bytes > max_size:
        max_size_gb = max_size / (1024 ** 3)

        raise ValueError(
            f"Video is too large for {platform.value}. "
            f"Maximum allowed size is {max_size_gb:g} GB."
        )