from fastapi import APIRouter, Depends

router = APIRouter(tags=["user"])


@router.get("/user/me")
def get_current_user():
    return {
        "user_id": "dev_user",
        "email": "dev@local",
    }
