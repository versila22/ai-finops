from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.core.db import get_db
from app.models.alert import Alert
from app.models.provider import Provider
from app.models.user import User
from app.schemas.dashboard import AlertResponse, DashboardResponse
from app.schemas.provider import ProviderResponse
from app.services.dashboard_service import compute_kpis

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    providers = db.query(Provider).all()
    alerts = db.query(Alert).all()
    kpis = compute_kpis(db)

    return DashboardResponse(
        providers=[ProviderResponse.model_validate(p) for p in providers],
        alerts=[AlertResponse.model_validate(a) for a in alerts],
        kpis=kpis,
    )
