from api.database.session import SessionLocal
from api.models.campaign import Campaign
from api.roles.campaign import Status


def get_campaigns():
    db = SessionLocal()
    try:
        return db.query(Campaign).all()
    finally:
        db.close()


def get_campaign(campaign_id: int):
    db = SessionLocal()
    try:
        return db.query(Campaign).filter(Campaign.id == campaign_id).first()
    finally:
        db.close()


def create_campaign(campaign, user_id):
    db = SessionLocal()
    try:
        new_campaign = Campaign(
            user_id=user_id,
            title=campaign.title,
            description=campaign.description,
            platform=campaign.platform,
            budget=campaign.budget,
            objectives=campaign.objectives,
            start_date=campaign.start_date,
            end_date=campaign.end_date,
            status=Status.DRAFT
        )

        db.add(new_campaign)
        db.commit()
        db.refresh(new_campaign)

        return {
            "message": "Campaign created successfully",
            "id": new_campaign.id
        }

    finally:
        db.close()


def update_campaign(campaign_id, data):
    db = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()

        if not campaign:
            return {"message": "Campaign not found"}

        if data.title is not None:
            campaign.title = data.title

        if data.description is not None:
            campaign.description = data.description

        if data.platform is not None:
            campaign.platform = data.platform

        if data.budget is not None:
            campaign.budget = data.budget

        if data.objectives is not None:
            campaign.objectives = data.objectives

        if data.start_date is not None:
            campaign.start_date = data.start_date

        if data.end_date is not None:
            campaign.end_date = data.end_date

        if data.status is not None:
            campaign.status = data.status

        db.commit()
        db.refresh(campaign)

        return campaign

    finally:
        db.close()


def delete_campaign(campaign_id):
    db = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()

        if not campaign:
            return {"message": "Campaign not found"}

        db.delete(campaign)
        db.commit()

        return {"message": "Campaign deleted successfully"}

    finally:
        db.close()