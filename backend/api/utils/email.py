def send_mock_email(
        user_email: str,
        subject: str, message:
        str
) -> None:
    """
    Simulates sending an email notification to avoid SMTP configuration 
    bottlenecks right before project evaluations.
    """
    print("\n" + "="*50)
    print("📧 EMAIL NOTIFICATION SENT")
    print(f"To: {user_email}")
    print(f"Subject: {subject}")
    print(f"Message: {message}")
    print("="*50 + "\n")
