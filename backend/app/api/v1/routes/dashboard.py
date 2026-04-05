from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.provider import Provider
from app.models.alert import Alert
from app.schemas.dashboard import DashboardResponse, AlertResponse
from app.schemas.provider import ProviderResponse
from app.services.dashboard_service import compute_kpis

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    providers = db.query(Provider).all()
    alerts = db.query(Alert).all()
    kpis = compute_kpis(db)

    return DashboardResponse(
        providers=[ProviderResponse.model_validate(p) for p in providers],
        alerts=[AlertResponse.model_validate(a) for a in alerts],
        kpis=kpis,
    )
