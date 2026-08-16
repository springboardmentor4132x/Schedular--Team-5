# Social Pilot - Backend API (Team 5)

A robust, highly modular FastAPI backend designed to handle automated social media scheduling, real-time analytics aggregation, and comprehensive reporting. 

This system integrates directly with OAuth 2.0 providers (YouTube, LinkedIn, X, Pinterest) and utilizes asynchronous task queues to ensure reliable post publishing and data extraction without blocking the main application thread.

## 🚀 Tech Stack
* **Framework:** FastAPI (Python 3.13+)
* **Database:** PostgreSQL (with SQLAlchemy 2.0 ORM & Alembic Migrations)
* **Task Queue & Broker:** Celery & Redis
* **Data Processing & Export:** Pandas, FPDF2
* **Authentication:** JWT & FastAPI-SSO (OAuth 2.0)
* **Package Management:** `uv` / `pip`

---

## 📂 Project Architecture

The application strictly follows a modular, domain-driven design pattern to separate concerns and ensure maintainability:

```text
backend/
├── alembic/                # Database migration scripts
├── api/
│   ├── auth/               # JWT and authentication logic
│   ├── core/               # App configuration and Celery setup
│   ├── database/           # PostgreSQL connection sessions
│   ├── dependencies/       # Reusable FastAPI dependencies (e.g., get_db)
│   ├── exceptions/         # Custom error handling (e.g., integrations)
│   ├── models/             # SQLAlchemy database tables
│   ├── roles/              # Enums and data constraints
│   ├── routers/            # API Endpoints (Analytics, Schedule, Reports, etc.)
│   ├── schemas/            # Pydantic validation models
│   ├── services/           # Core business logic
│   ├── tasks/              # Celery background workers (LinkedIn, YouTube)
│   └── utils/              # Helper functions (e.g., mock emails)
├── main.py                 # FastAPI application entry point
└── pyproject.toml          # Project metadata and dependencies
```

---

## 🛠️ Local Setup & Installation

Follow these steps to spin up the backend locally for frontend integration or testing.

### 1. Prerequisites
Ensure you have the following installed on your machine:
* Python >= 3.13
* PostgreSQL
* Redis Server (Running locally or via Docker)

### 2. Clone and Install Dependencies
This project uses modern dependency management. You can install via standard `pip` or use `uv` for faster resolutions.

```bash
# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the root `backend/` directory. Use the provided `.env.example` as your template.

```env
# Database & Core
DATABASE_URL=postgresql://user:password@localhost:5432/social_pilot
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=True

# Redis Broker for Celery
REDIS_URL=redis://localhost:6379/0

# OAuth 2.0 Credentials (Get these from Google Cloud / LinkedIn Dev Portal)
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=http://localhost:8000/youtube/callback

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=http://localhost:8000/linkedin/callback

# (Add X and Pinterest credentials as needed)
```

### 4. Database Migrations
Initialize your PostgreSQL database tables using Alembic:

```bash
alembic upgrade head
```

---

## 🏃‍♂️ Running the Application

To fully test the application (including scheduled posts and report generation), you must run both the FastAPI server and the Celery worker simultaneously in **two separate terminal windows**.

### Terminal 1: Start the API Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Once running, the interactive API documentation will be available at:
* **Swagger UI:** `http://localhost:8000/docs`
* **ReDoc:** `http://localhost:8000/redoc`

### Terminal 2: Start the Background Worker (Celery)
Ensure your Redis server is running, then start the worker to listen for scheduled tasks.

**For Windows:**
```bash
celery -A api.core.celery_setup worker --loglevel=info --pool=solo
```
**For Mac/Linux:**
```bash
celery -A api.core.celery_setup worker --loglevel=info
```

---

## 📊 Key Features & Modules
* **Automated Scheduling:** Queues posts to multiple platforms simultaneously using Celery and Redis. Handles live status updates and automatic failure logging.
* **Aggregated Analytics:** Fetches live impressions, clicks, and geographic demographics directly from platform APIs with seamless automatic OAuth token refreshing.
* **Dynamic Reporting:** Exports live system statistics and blended analytics into structured CSVs (via Pandas) and professional PDF documents (via FPDF2).
* **Event Notifications:** Tracks all publishing logs, campaign creations, and account linking activities for the frontend dashboard.

---