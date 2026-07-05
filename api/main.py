from fastapi import FastAPI
from api.routers.social_account import router as social_account_router

app = FastAPI(title="SocialPilot")

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(social_account_router)
