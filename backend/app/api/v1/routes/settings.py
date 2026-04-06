from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.core.db import get_db
from app.models.settings import Settings
from app.models.user import User
from app.schemas.settings import SettingsResponse, SettingsUpdate

router = APIRouter()


@router.get("/settings", response_model=SettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = db.query(Settings).filter_by(id="global").first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return SettingsResponse.model_validate(settings)


@router.put("/settings", response_model=SettingsResponse)
def update_settings(
    update: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = db.query(Settings).filter_by(id="global").first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return SettingsResponse.model_validate(settings)
