from api.database.session import SessionLocal
from api.models.notification_preference import NotificationPreference

# =========================================================

# GET NOTIFICATION SETTINGS

# =========================================================

def get_notification_settings(
user_id: int,
):
"""
Get notification preferences for the specified user.

```
If the user does not have a preference record yet,
create one with the model's default values.
"""

db = SessionLocal()

try:
    preference = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id
        )
        .first()
    )

    # -------------------------------------------------
    # CREATE DEFAULT PREFERENCES IF NOT FOUND
    # -------------------------------------------------

    if not preference:

        preference = NotificationPreference(
            user_id=user_id,
        )

        db.add(preference)
        db.commit()
        db.refresh(preference)

        print("=================================================", flush=True)
        print(
            ">>> DEFAULT NOTIFICATION PREFERENCES CREATED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> PREFERENCE ID: {preference.id}",
            flush=True,
        )
        print("=================================================", flush=True)

    else:

        print("=================================================", flush=True)
        print(
            ">>> NOTIFICATION PREFERENCES FOUND",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> PREFERENCE ID: {preference.id}",
            flush=True,
        )
        print("=================================================", flush=True)

    return preference

finally:
    db.close()
```

# =========================================================

# UPDATE NOTIFICATION SETTINGS

# =========================================================

def update_notification_settings(
user_id: int,
updates: dict,
):
"""
Update notification preferences for the specified user.

```
Only fields supplied in the updates dictionary are changed.
"""

db = SessionLocal()

try:
    preference = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id
        )
        .first()
    )

    # -------------------------------------------------
    # CREATE DEFAULT RECORD IF IT DOES NOT EXIST
    # -------------------------------------------------

    if not preference:

        preference = NotificationPreference(
            user_id=user_id,
        )

        db.add(preference)
        db.flush()

        print("=================================================", flush=True)
        print(
            ">>> CREATED DEFAULT PREFERENCES BEFORE UPDATE",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print("=================================================", flush=True)

    # -------------------------------------------------
    # UPDATE ONLY PROVIDED FIELDS
    # -------------------------------------------------

    allowed_fields = {
        "publishing_notifications_enabled",
        "campaign_notifications_enabled",
        "account_activity_notifications_enabled",
        "team_collaboration_notifications_enabled",
        "system_notifications_enabled",
        "in_app_notifications_enabled",
        "email_notifications_enabled",
        "push_notifications_enabled",
        "email_frequency",
        "promotional_emails_enabled",
    }

    for field, value in updates.items():

        if field not in allowed_fields:
            continue

        if value is None:
            continue

        setattr(
            preference,
            field,
            value,
        )

    db.commit()
    db.refresh(preference)

    print("=================================================", flush=True)
    print(
        ">>> NOTIFICATION PREFERENCES UPDATED",
        flush=True,
    )
    print(
        f">>> USER ID: {user_id}",
        flush=True,
    )
    print(
        f">>> PREFERENCE ID: {preference.id}",
        flush=True,
    )
    print(
        f">>> EMAIL ENABLED: "
        f"{preference.email_notifications_enabled}",
        flush=True,
    )
    print(
        f">>> EMAIL FREQUENCY: "
        f"{preference.email_frequency}",
        flush=True,
    )
    print("=================================================", flush=True)

    return preference

except Exception as exc:

    db.rollback()

    print("=================================================", flush=True)
    print(
        ">>> NOTIFICATION PREFERENCES UPDATE FAILED",
        flush=True,
    )
    print(
        f">>> USER ID: {user_id}",
        flush=True,
    )
    print(
        f">>> ERROR: {exc}",
        flush=True,
    )
    print("=================================================", flush=True)

    raise

finally:
    db.close()
```

# =========================================================

# GET EMAIL PREFERENCES

# =========================================================

def get_email_preferences(
user_id: int,
):
"""
Get only the email-related notification preferences.
"""

```
db = SessionLocal()

try:
    preference = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id
        )
        .first()
    )

    # -------------------------------------------------
    # CREATE DEFAULT PREFERENCES IF NOT FOUND
    # -------------------------------------------------

    if not preference:

        preference = NotificationPreference(
            user_id=user_id,
        )

        db.add(preference)
        db.commit()
        db.refresh(preference)

        print("=================================================", flush=True)
        print(
            ">>> DEFAULT EMAIL PREFERENCES CREATED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print("=================================================", flush=True)

    return preference

finally:
    db.close()
```

# =========================================================

# UPDATE EMAIL PREFERENCES

# =========================================================

def update_email_preferences(
user_id: int,
updates: dict,
):
"""
Update only email-related notification preferences.
"""

```
db = SessionLocal()

try:
    preference = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id
        )
        .first()
    )

    # -------------------------------------------------
    # CREATE DEFAULT RECORD IF IT DOES NOT EXIST
    # -------------------------------------------------

    if not preference:

        preference = NotificationPreference(
            user_id=user_id,
        )

        db.add(preference)
        db.flush()

    # -------------------------------------------------
    # UPDATE EMAIL FIELDS ONLY
    # -------------------------------------------------

    allowed_fields = {
        "email_notifications_enabled",
        "email_frequency",
        "promotional_emails_enabled",
    }

    for field, value in updates.items():

        if field not in allowed_fields:
            continue

        if value is None:
            continue

        setattr(
            preference,
            field,
            value,
        )

    db.commit()
    db.refresh(preference)

    print("=================================================", flush=True)
    print(
        ">>> EMAIL PREFERENCES UPDATED",
        flush=True,
    )
    print(
        f">>> USER ID: {user_id}",
        flush=True,
    )
    print(
        f">>> EMAIL ENABLED: "
        f"{preference.email_notifications_enabled}",
        flush=True,
    )
    print(
        f">>> EMAIL FREQUENCY: "
        f"{preference.email_frequency}",
        flush=True,
    )
    print(
        f">>> PROMOTIONAL EMAILS: "
        f"{preference.promotional_emails_enabled}",
        flush=True,
    )
    print("=================================================", flush=True)

    return preference

except Exception as exc:

    db.rollback()

    print("=================================================", flush=True)
    print(
        ">>> EMAIL PREFERENCES UPDATE FAILED",
        flush=True,
    )
    print(
        f">>> USER ID: {user_id}",
        flush=True,
    )
    print(
        f">>> ERROR: {exc}",
        flush=True,
    )
    print("=================================================", flush=True)

    raise

finally:
    db.close()
