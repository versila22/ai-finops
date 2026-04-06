from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/health")
def health_check(current_user: User = Depends(get_current_user)):
    return {"status": "ok", "version": "0.1.0", "user": current_user.email}
