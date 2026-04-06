from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.core.db import get_db
from app.core.rate_limit import limiter
from app.models.adjustment import ManualAdjustment
from app.models.alert import Alert
from app.models.provider import Provider
from app.models.user import User
from app.schemas.dashboard import AlertResponse, ManualAdjustmentResponse
from app.schemas.provider import ProviderResponse, ProviderUpdate
from app.services.dashboard_service import generate_daily_usage
from app.services.sync import sync_all_providers, sync_provider_by_id

router = APIRouter()


@router.get("/providers", response_model=list[ProviderResponse])
def list_providers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    providers = db.query(Provider).all()
    return [ProviderResponse.model_validate(p) for p in providers]


@router.get("/providers/{provider_id}")
def get_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = db.query(Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    daily_usage = generate_daily_usage(provider)
    alerts = db.query(Alert).filter_by(provider_id=provider_id).all()
    adjustments = db.query(ManualAdjustment).filter_by(provider_id=provider_id).all()

    return {
        "provider": ProviderResponse.model_validate(provider).model_dump(by_alias=True),
        "dailyUsage": [d.model_dump(by_alias=True) for d in daily_usage],
        "alerts": [AlertResponse.model_validate(a).model_dump(by_alias=True) for a in alerts],
        "adjustments": [ManualAdjustmentResponse.model_validate(a).model_dump(by_alias=True) for a in adjustments],
    }


@router.put("/providers/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: str,
    update: ProviderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = db.query(Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(provider, key, value)

    if "consumed" in update_data:
        provider.remaining = max(0, provider.included_quota - provider.consumed)
        provider.usage_percent = round((provider.consumed / provider.included_quota) * 100) if provider.included_quota > 0 else 0

    db.commit()
    db.refresh(provider)
    return ProviderResponse.model_validate(provider)


async def _run_sync_all(db: Session):
    results = await sync_all_providers(db)
    providers = db.query(Provider).all()
    return {
        "sync_results": results,
        "providers": [ProviderResponse.model_validate(p).model_dump(by_alias=True) for p in providers],
    }


@router.post("/sync")
@router.post("/sync/all")
@limiter.limit("5/minute")
async def sync_all(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger sync for all auto-sync providers."""
    return await _run_sync_all(db)


async def _run_sync_provider(provider_id: str, db: Session):
    provider = db.query(Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    result = await sync_provider_by_id(provider_id, db)
    db.refresh(provider)
    return {
        "sync_result": result,
        "provider": ProviderResponse.model_validate(provider).model_dump(by_alias=True),
    }


@router.post("/providers/{provider_id}/sync")
@router.post("/sync/{provider_id}")
async def sync_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger sync for a specific provider."""
    return await _run_sync_provider(provider_id, db)
