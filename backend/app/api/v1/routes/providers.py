from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.core.db import get_db
from app.core.rate_limit import limiter
from app.models.adjustment import ManualAdjustment
from app.models.alert import Alert
from app.models.plan import Plan
from app.models.provider import Provider
from app.models.user import User
from app.schemas.dashboard import AlertResponse, ManualAdjustmentResponse
from app.schemas.provider import ProviderCreate, ProviderResponse, ProviderUpdate
from app.api.v1.routes.dashboard import invalidate_dashboard_cache
from app.services.dashboard_service import generate_daily_usage
from app.services.sync import sync_all_providers, sync_provider_by_id

router = APIRouter()


def _slugify_provider_name(name: str) -> str:
    return "-".join(name.strip().lower().split())


def _recompute_provider_metrics(provider: Provider):
    provider.remaining = max(0, provider.included_quota - provider.consumed)
    provider.usage_percent = round((provider.consumed / provider.included_quota) * 100) if provider.included_quota > 0 else 0
    provider.projected_end_of_cycle = provider.usage_percent


@router.get("/providers", response_model=list[ProviderResponse])
def list_providers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # TODO multi-user: Provider has no user_id FK yet, so data is globally shared across users.
    providers = db.query(Provider).all()
    return [ProviderResponse.model_validate(p) for p in providers]


@router.post("/providers", response_model=ProviderResponse, status_code=201)
def create_provider(
    payload: ProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider_id = _slugify_provider_name(payload.name)
    if not provider_id:
        raise HTTPException(status_code=422, detail="Provider name is required")

    existing_provider = db.query(Provider).filter_by(id=provider_id).first()
    if existing_provider:
        raise HTTPException(status_code=409, detail="Provider already exists")

    provider = Provider(
        id=provider_id,
        name=payload.name,
        logo=payload.logo,
        category=payload.category,
        plan=payload.plan,
        plan_type=payload.plan_type,
        monthly_cost=payload.monthly_cost,
        included_quota=payload.included_quota,
        quota_unit=payload.quota_unit,
        consumed=payload.consumed,
        reset_date=payload.reset_date,
        days_until_reset=payload.days_until_reset,
        sync_status=payload.sync_status,
        data_origin=payload.data_origin,
        last_sync="",
        overage=0,
        recommendation="maintain",
        recommendation_text="Suivi manuel",
        recommendation_detail="Ajouté manuellement depuis l'interface.",
        savings=None,
        urgency="low",
        trend="stable",
        projected_end_of_cycle=0,
    )
    _recompute_provider_metrics(provider)

    db.add(provider)
    db.add(
        Plan(
            id=f"plan-{provider_id}",
            provider_id=provider_id,
            provider_name=payload.name,
            name=payload.plan,
            plan_type=payload.plan_type,
            monthly_cost=payload.monthly_cost,
            included_quota=payload.included_quota,
            quota_unit=payload.quota_unit,
        )
    )
    db.commit()
    db.refresh(provider)
    invalidate_dashboard_cache()
    return ProviderResponse.model_validate(provider)


@router.get("/providers/{provider_id}")
def get_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = db.query(Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    daily_usage = generate_daily_usage(db, provider_id)
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

    if {"consumed", "included_quota", "remaining", "usage_percent", "projected_end_of_cycle"} & set(update_data.keys()):
        _recompute_provider_metrics(provider)

    if {"name", "plan", "plan_type", "monthly_cost", "included_quota", "quota_unit"} & set(update_data.keys()):
        plan = db.query(Plan).filter_by(provider_id=provider_id).first()
        if plan:
            plan.provider_name = provider.name
            plan.name = provider.plan
            plan.plan_type = provider.plan_type
            plan.monthly_cost = provider.monthly_cost
            plan.included_quota = provider.included_quota
            plan.quota_unit = provider.quota_unit

    db.commit()
    db.refresh(provider)
    invalidate_dashboard_cache()
    return ProviderResponse.model_validate(provider)


@router.delete("/providers/{provider_id}", status_code=204)
def delete_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = db.query(Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    db.query(Alert).filter_by(provider_id=provider_id).delete()
    db.query(ManualAdjustment).filter_by(provider_id=provider_id).delete()
    db.query(Plan).filter_by(provider_id=provider_id).delete()
    db.delete(provider)
    db.commit()
    invalidate_dashboard_cache()
    return Response(status_code=204)


async def _run_sync_all(db: Session):
    results = await sync_all_providers(db)
    invalidate_dashboard_cache()
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
    invalidate_dashboard_cache()
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
