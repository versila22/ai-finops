import math
import random

from sqlalchemy.orm import Session

from app.models.provider import Provider
from app.models.alert import Alert
from app.models.settings import Settings
from app.schemas.dashboard import KPIs
from app.schemas.provider import DailyUsageResponse


def compute_kpis(db: Session) -> KPIs:
    providers = db.query(Provider).all()
    alerts = db.query(Alert).all()
    settings = db.query(Settings).filter_by(id="global").first()

    monthly_budget = settings.monthly_budget if settings else 1200
    total_plan_spend = sum(p.monthly_cost for p in providers)
    total_overage = sum(p.overage for p in providers)
    total_spend = total_plan_spend + total_overage
    budget_used_percent = round((total_spend / monthly_budget) * 100) if monthly_budget > 0 else 0
    active_alert_count = sum(1 for a in alerts if a.status.value == "active")

    # potential savings from providers with savings field
    potential_savings = 0.0
    for p in providers:
        if p.savings:
            # Extract number from strings like "~€300" or "~€30/mo"
            val = p.savings.replace("~", "").replace("€", "").replace("/mo", "").strip()
            try:
                potential_savings += float(val)
            except ValueError:
                pass

    return KPIs(
        monthly_budget=monthly_budget,
        total_plan_spend=total_plan_spend,
        total_overage=total_overage,
        total_spend=total_spend,
        budget_used_percent=budget_used_percent,
        active_alert_count=active_alert_count,
        potential_savings=potential_savings,
    )


def generate_daily_usage(provider: Provider) -> list[DailyUsageResponse]:
    """Generate daily usage data for a provider (mimics frontend logic)."""
    if not provider:
        return []

    base_daily = provider.consumed / 30
    data: list[DailyUsageResponse] = []
    cumulative = 0.0

    random.seed(hash(provider.id))  # deterministic per provider

    for i in range(1, 31):
        day_variance = 0.3 + math.sin(i * 0.4) * 0.5 + random.random() * 0.5
        consumed = round(base_daily * day_variance)
        cumulative += consumed
        if i <= 4:
            data.append(DailyUsageResponse(
                date=f"Apr {i}",
                consumed=consumed,
                cumulative=min(cumulative, provider.consumed),
            ))

    return data
