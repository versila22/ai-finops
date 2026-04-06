from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.daily_usage import DailyUsage
from app.models.provider import Provider
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


def generate_daily_usage(db: Session, provider_id: str, days: int = 30) -> list[DailyUsageResponse]:
    """Return real daily usage snapshots from the database."""
    if days <= 0:
        return []

    start_date = date.today() - timedelta(days=days - 1)
    snapshots = (
        db.query(DailyUsage)
        .filter(DailyUsage.provider_id == provider_id, DailyUsage.date >= start_date)
        .order_by(DailyUsage.date.asc())
        .all()
    )

    cumulative = 0.0
    data: list[DailyUsageResponse] = []
    for snapshot in snapshots:
        cumulative += snapshot.cost_usd
        data.append(
            DailyUsageResponse(
                date=snapshot.date.isoformat(),
                consumed=round(snapshot.cost_usd, 4),
                cumulative=round(cumulative, 4),
            )
        )

    return data
