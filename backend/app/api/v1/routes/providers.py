from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.provider import Provider
from app.models.alert import Alert
from app.models.adjustment import ManualAdjustment
from app.schemas.provider import ProviderResponse, ProviderUpdate
from app.schemas.dashboard import AlertResponse, ManualAdjustmentResponse
from app.services.dashboard_service import generate_daily_usage
from app.services.sync import sync_all_providers, sync_provider_by_id

router = APIRouter()


@router.get("/providers", response_model=list[ProviderResponse])
def list_providers(db: Session = Depends(get_db)):
    providers = db.query(Provider).all()
    return [ProviderResponse.model_validate(p) for p in providers]


@router.get("/providers/{provider_id}")
def get_provider(provider_id: str, db: Session = Depends(get_db)):
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
def update_provider(provider_id: str, update: ProviderUpdate, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(provider, key, value)

    # Recompute remaining and usage_percent if consumed changed
    if "consumed" in update_data:
        provider.remaining = max(0, provider.included_quota - provider.consumed)
        provider.usage_percent = round((provider.consumed / provider.included_quota) * 100) if provider.included_quota > 0 else 0

    db.commit()
    db.refresh(provider)
    return ProviderResponse.model_validate(provider)


@router.post("/sync")
async def sync_all(db: Session = Depends(get_db)):
    """Trigger sync for all auto-sync providers (OpenAI, ElevenLabs)."""
    results = await sync_all_providers(db)
    providers = db.query(Provider).all()
    return {
        "sync_results": results,
        "providers": [ProviderResponse.model_validate(p).model_dump(by_alias=True) for p in providers],
    }


@router.post("/providers/{provider_id}/sync")
async def sync_provider(provider_id: str, db: Session = Depends(get_db)):
    """Trigger sync for a specific provider."""
    provider = db.query(Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    result = await sync_provider_by_id(provider_id, db)
    db.refresh(provider)
    return {
        "sync_result": result,
        "provider": ProviderResponse.model_validate(provider).model_dump(by_alias=True),
    }
