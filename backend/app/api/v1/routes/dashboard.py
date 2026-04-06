from datetime import datetime, timedelta, timezone

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
_cache: dict[str, dict] = {}
_CACHE_TTL = timedelta(seconds=60)


def invalidate_dashboard_cache():
    _cache.clear()


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cached = _cache.get("dashboard")
    now = datetime.now(timezone.utc)
    if cached and now - cached["timestamp"] < _CACHE_TTL:
        return cached["data"]

    providers = db.query(Provider).all()
    alerts = db.query(Alert).all()
    kpis = compute_kpis(db)

    response = DashboardResponse(
        providers=[ProviderResponse.model_validate(p) for p in providers],
        alerts=[AlertResponse.model_validate(a) for a in alerts],
        kpis=kpis,
    )
    _cache["dashboard"] = {"timestamp": now, "data": response}
    return response
