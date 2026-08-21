
import io
import pandas as pd
from fpdf import FPDF
from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime

from api.dependencies.database import get_db
from api.models.schedule import Schedule
from api.models.social_account import SocialAccount
from api.roles.schedule import Status as ScheduleStatus

from api.routers.analytics import (
    get_youtube_audience_analytics,
    get_youtube_performance_trends,
    get_linkedin_audience,
    get_linkedin_trends,
    get_x_audience,
    get_x_trends,
    get_pinterest_audience,  
    get_pinterest_trends,
    get_facebook_audience,
    get_facebook_demographics,
    get_facebook_trends
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


async def fetch_real_analytics_data(
        db: Session
):
    data = {
        "youtube": {"posts": 0, "impressions": 0, "clicks": 0, "followers": 0, "top_demo": "N/A", "roi": "N/A"},
        "linkedin": {"posts": 0, "impressions": 0, "clicks": 0, "followers": 0, "top_demo": "N/A", "roi": "N/A"},
        "x": {"posts": 0, "impressions": 0, "clicks": 0, "followers": 0, "top_demo": "N/A", "roi": "N/A"},
        "pinterest": {"posts": 0, "impressions": 0, "clicks": 0, "followers": 0, "top_demo": "N/A", "roi": "N/A"},
        "facebook": {"posts": 0, "impressions": 0, "clicks": 0, "followers": 0, "top_demo": "N/A", "roi": "N/A"}
    }

    data["youtube"]["posts"] = db.query(Schedule).join(SocialAccount).filter(
        SocialAccount.platform == "youtube", Schedule.status == ScheduleStatus.PUBLISHED).count()

    data["linkedin"]["posts"] = db.query(Schedule).join(SocialAccount).filter(
        SocialAccount.platform == "linkedin", Schedule.status == ScheduleStatus.PUBLISHED).count()

    data["x"]["posts"] = db.query(Schedule).join(SocialAccount).filter(
        SocialAccount.platform == "x", Schedule.status == ScheduleStatus.PUBLISHED).count()

    data["pinterest"]["posts"] = db.query(Schedule).join(SocialAccount).filter(
        SocialAccount.platform == "pinterest", Schedule.status == ScheduleStatus.PUBLISHED).count()

    data["facebook"]["posts"] = db.query(Schedule).join(SocialAccount).filter(
        SocialAccount.platform == "facebook", Schedule.status == ScheduleStatus.PUBLISHED).count()

    youtube_accounts = db.query(SocialAccount).filter(SocialAccount.platform == "youtube").all()
    for acc in youtube_accounts:
        try:
            aud_stats = await get_youtube_audience_analytics(acc.account_id, db)
            trend_stats = await get_youtube_performance_trends(acc.account_id, db)

            data["youtube"]["impressions"] += aud_stats.get("audience", {}).get("total_views", 0)
            data["youtube"]["followers"] += aud_stats.get("audience", {}).get("subscriber_count", 0)

            for day in trend_stats.get("data", []):
                data["youtube"]["clicks"] += (day.get("likes", 0) + day.get("comments", 0))

            data["youtube"]["top_demo"] = "18-24 (Estimated)"
            data["youtube"]["roi"] = "Organic"
        except Exception:
            pass

    linkedin_accounts = db.query(SocialAccount).filter(SocialAccount.platform == "linkedin").all()
    for acc in linkedin_accounts:
        try:
            li_aud = await get_linkedin_audience(acc.account_id, db)
            li_trends = await get_linkedin_trends(acc.account_id, db)

            data["linkedin"]["followers"] += li_aud.get("data", {}).get("total_followers", 0)

            for day in li_trends.get("data", []):
                data["linkedin"]["impressions"] += day.get("impressions", 0)
                data["linkedin"]["clicks"] += (day.get("clicks", 0) + day.get("reactions", 0) + day.get("comments", 0))

            data["linkedin"]["top_demo"] = "IT Professionals"
            data["linkedin"]["roi"] = "Organic"
        except Exception:
            pass

    x_accounts = db.query(SocialAccount).filter(SocialAccount.platform == "x").all()
    for acc in x_accounts:
        try:
            x_aud = await get_x_audience(acc.account_id, db)
            x_trends = await get_x_trends(acc.account_id, db)

            data["x"]["followers"] += x_aud.get("data", {}).get("total_followers", 0)

            for day in x_trends.get("data", []):
                data["x"]["impressions"] += day.get("impressions", 0)
                data["x"]["clicks"] += (day.get("likes", 0) + day.get("retweets", 0) + day.get("replies", 0))

            data["x"]["top_demo"] = "18-35 (Tech & Media)"
            data["x"]["roi"] = "Organic"
        except Exception:
            pass

    pinterest_accounts = db.query(SocialAccount).filter(SocialAccount.platform == "pinterest").all()
    for acc in pinterest_accounts:
        try:
            pin_aud = await get_pinterest_audience(acc.account_id, db)
            pin_trends = await get_pinterest_trends(acc.account_id, db)

            data["pinterest"]["followers"] += pin_aud.get("data", {}).get("total_followers", 0)

            for day in pin_trends.get("data", []):
                data["pinterest"]["impressions"] += day.get("impressions", 0)
                data["pinterest"]["clicks"] += (
                            day.get("clicks", 0) + day.get("saves", 0) + day.get("outbound_clicks", 0))

            data["pinterest"]["top_demo"] = "25-45 (Design & Lifestyle)"
            data["pinterest"]["roi"] = "Organic"
        except Exception:
            pass

    facebook_accounts = db.query(SocialAccount).filter(SocialAccount.platform == "facebook").all()
    for acc in facebook_accounts:
        try:
            pin_aud = await get_facebook_audience(acc.account_id, db)
            pin_trends = await get_facebook_trends(acc.account_id, db)

            data["facebook"]["followers"] += pin_aud.get("data", {}).get("total_followers", 0)

            for day in pin_trends.get("data", []):
                data["facebook"]["impressions"] += day.get("impressions", 0)
                data["facebook"]["clicks"] += (
                            day.get("clicks", 0) + day.get("saves", 0) + day.get("outbound_clicks", 0))

            data["facebook"]["top_demo"] = "25-45 (Design & Lifestyle)"
            data["facebook"]["roi"] = "Organic"
        except Exception:
            pass

    return data


@router.get("/export/{platform}/excel")
async def export_platform_excel(
        platform: str = Path(..., description="Must be 'youtube', 'linkedin', 'x', or 'pinterest'"),
        db: Session = Depends(get_db)
):
    if platform not in ["youtube", "linkedin", "x", "pinterest", "facebook"]:
        raise HTTPException(status_code=400, detail="Invalid platform.")

    real_data = await fetch_real_analytics_data(db)
    stats = real_data[platform]

    rows = [
        {"Category": "Content Analytics", "Metric": "Published Posts", "Value": stats["posts"]},
        {"Category": "Content Analytics", "Metric": "Total Views/Impressions", "Value": stats["impressions"]},
        {"Category": "Content Analytics", "Metric": "Total Interactions", "Value": stats["clicks"]},
        {"Category": "Audience Analytics", "Metric": "Total Subscribers/Followers", "Value": stats["followers"]},
        {"Category": "Audience Analytics", "Metric": "Top Demographic", "Value": stats["top_demo"]},
        {"Category": "Campaign Analytics", "Metric": "Estimated ROI", "Value": stats["roi"]}
    ]

    df = pd.DataFrame(rows)
    stream = io.StringIO()
    df.to_csv(stream, index=False)

    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=social_pilot_{platform}_report.csv"
    return response


@router.get("/export/{platform}/pdf")
async def export_platform_pdf(
        platform: str = Path(..., description="Must be 'youtube', 'linkedin', 'x', or 'pinterest'"),
        db: Session = Depends(get_db)
):
    if platform not in ["youtube", "linkedin", "x", "pinterest", "facebook"]:
        raise HTTPException(status_code=400, detail="Invalid platform.")

    real_data = await fetch_real_analytics_data(db)
    stats = real_data[platform]

    if platform == "youtube":
        p_name, header_color = "YouTube", (255, 0, 0)
    elif platform == "linkedin":
        p_name, header_color = "LinkedIn", (0, 119, 181)
    elif platform == "x":
        p_name, header_color = "X (Twitter)", (15, 20, 25)
    elif platform == "pinterest":
        p_name, header_color = "Pinterest", (230, 0, 35)
    else:
        p_name, header_color = "Facebook", (255, 0, 0)

    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", "B", 18)
    pdf.set_text_color(*header_color)
    pdf.cell(0, 10, f"Social Pilot - {p_name} Report", ln=True, align="C")

    pdf.set_font("Arial", "I", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align="C")
    pdf.ln(10)

    pdf.set_text_color(0, 0, 0)

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "1. Content Analytics", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 8, f"- Published Posts (Via App): {stats['posts']}", ln=True)
    pdf.cell(0, 8, f"- Total Channel Views: {stats['impressions']:,}", ln=True)
    pdf.cell(0, 8, f"- Recent Interactions: {stats['clicks']:,}", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "2. Audience Analytics", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 8, f"- Total Subscribers/Followers: {stats['followers']:,}", ln=True)
    pdf.cell(0, 8, f"- Top Demographic: {stats['top_demo']}", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "3. Campaign Analytics", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 8, f"- ROI Tracking: {stats['roi']}", ln=True)

    pdf_bytes = pdf.output()

    response = StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")
    response.headers["Content-Disposition"] = f"attachment; filename=social_pilot_{platform}_report.pdf"
    return response
