from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from api.integrations import pinterest
from api.database.session import SessionLocal
from api.models.social_account import SocialAccount
from api.roles.social_account import Platform


router = APIRouter(
    prefix="/auth/pinterest",
    tags=["Pinterest"]
)



def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()




@router.get("/login")
def pinterest_login():

    url = pinterest.get_authorization_url()


    return {
        "url": url
    }





@router.get("/callback")
def pinterest_callback(
    code: str,
    db: Session = Depends(get_db)
):

    try:

        token = pinterest.get_access_token(
            code
        )


        access_token = token.get(
            "access_token"
        )


        if not access_token:

            raise Exception(
                "Pinterest access token missing"
            )



        profile = pinterest.get_profile(
            access_token
        )



        account_id = str(
            profile.get("id")
        )


        account_name = (
            profile.get("username")
            or
            profile.get("name")
            or
            "Pinterest Account"
        )



        account = SocialAccount(

            user_id=1,

            platform=Platform.PINTEREST,

            account_name=account_name,

            account_id=account_id,

            access_token=access_token,

            refresh_token=
                token.get("refresh_token"),

            is_connected=True,

            permissions=[
                "boards:read",
                "pins:write"
            ]

        )



        db.add(account)

        db.commit()

        db.refresh(account)



        return {

            "message":
            "Pinterest account connected successfully",

            "account":
            {
                "id": account.id,

                "name":
                account.account_name
            }
        }




    except Exception as e:


        raise HTTPException(

            status_code=400,

            detail=str(e)

        )





@router.get("/me")
def pinterest_me(
    access_token: str
):

    try:

        profile = pinterest.get_profile(
            access_token
        )

        return profile


    except Exception as e:

        raise HTTPException(

            status_code=400,

            detail=str(e)

        )