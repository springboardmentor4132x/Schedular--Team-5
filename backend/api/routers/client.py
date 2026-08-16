from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)

@router.get("/", response_model=List[Dict[str, Any]])
def get_clients():
    # Return a mock client list matching what your frontend expects (including ID 22 for Prajwal)
    return [
        {
            "id": 22,
            "full_name": "prajwal",
            "email": "prajwal123@gmail.com",
            "username": "prajwal_123"
        }
    ]