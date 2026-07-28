from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.session import SessionLocal
from api.auth.auth import get_current_user
from api.models.user import User
from api.models.business_assignment import BusinessAssignment


router = APIRouter(
    prefix="/business-assignment",
    tags=["Business Assignment"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/marketing-teams")
def get_marketing_teams(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    marketing_teams = (
        db.query(User)
        .filter(
            User.role == "marketing_team"
        )
        .all()
    )

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        for user in marketing_teams
    ]


@router.get("/my-assignment")
def get_my_assignment(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business_user = (
        db.query(User)
        .filter(
            User.username == current_user["username"]
        )
        .first()
    )

    if not business_user:
        raise HTTPException(
            status_code=404,
            detail="Business User not found"
        )

    assignment = (
        db.query(BusinessAssignment)
        .filter(
            BusinessAssignment.business_user_id
            == business_user.id
        )
        .first()
    )

    if not assignment:
        return {
            "assigned": False,
            "marketing_team": None
        }

    marketing_team = (
        db.query(User)
        .filter(
            User.id
            == assignment.marketing_team_id
        )
        .first()
    )

    return {
        "assigned": True,
        "marketing_team": {
            "id": marketing_team.id,
            "username": marketing_team.username,
            "email": marketing_team.email,
        }
        if marketing_team
        else None
    }


@router.post("/assign/{marketing_team_id}")
def assign_marketing_team(
    marketing_team_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business_user = (
        db.query(User)
        .filter(
            User.username == current_user["username"]
        )
        .first()
    )

    if not business_user:
        raise HTTPException(
            status_code=404,
            detail="Business User not found"
        )

    marketing_team = (
        db.query(User)
        .filter(
            User.id == marketing_team_id,
            User.role == "marketing_team"
        )
        .first()
    )

    if not marketing_team:
        raise HTTPException(
            status_code=404,
            detail="Marketing Team not found"
        )

    assignment = (
        db.query(BusinessAssignment)
        .filter(
            BusinessAssignment.business_user_id
            == business_user.id
        )
        .first()
    )

    if assignment:
        assignment.marketing_team_id = marketing_team_id
    else:
        assignment = BusinessAssignment(
            business_user_id=business_user.id,
            marketing_team_id=marketing_team_id
        )

        db.add(assignment)

    db.commit()
    db.refresh(assignment)

    return {
        "message": "Marketing Team assigned successfully",
        "business_user_id": business_user.id,
        "marketing_team_id": marketing_team_id
    }


@router.get("/my-clients")
def get_my_clients(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    marketing_team = (
        db.query(User)
        .filter(
            User.username == current_user["username"],
            User.role == "marketing_team"
        )
        .first()
    )

    if not marketing_team:
        raise HTTPException(
            status_code=404,
            detail="Marketing Team user not found"
        )

    assignments = (
        db.query(BusinessAssignment)
        .filter(
            BusinessAssignment.marketing_team_id
            == marketing_team.id
        )
        .all()
    )

    clients = []

    for assignment in assignments:
        business_user = (
            db.query(User)
            .filter(
                User.id
                == assignment.business_user_id
            )
            .first()
        )

        if business_user:
            clients.append({
                "id": business_user.id,
                "username": business_user.username,
                "email": business_user.email,
                "full_name": business_user.full_name,
            })

    return clients


@router.get("/client/{client_id}")
def get_client_details(
    client_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    marketing_team = (
        db.query(User)
        .filter(
            User.username == current_user["username"],
            User.role == "marketing_team"
        )
        .first()
    )

    if not marketing_team:
        raise HTTPException(
            status_code=404,
            detail="Marketing Team user not found"
        )

    assignment = (
        db.query(BusinessAssignment)
        .filter(
            BusinessAssignment.business_user_id
            == client_id,
            BusinessAssignment.marketing_team_id
            == marketing_team.id
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Client is not assigned to your Marketing Team"
        )

    client = (
        db.query(User)
        .filter(
            User.id == client_id,
            User.role == "business_user"
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    return {
        "id": client.id,
        "username": client.username,
        "email": client.email,
        "full_name": client.full_name,
    }