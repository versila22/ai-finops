from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.schemas.provider import ProviderResponse


class AlertResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    type: str
    severity: str
    provider_id: str
    provider_name: str
    trigger_date: str
    description: str
    recommended_action: str
    status: str


class ManualAdjustmentResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    provider_id: str
    provider_name: str
    type: str
    amount: float
    note: str
    date: str
    applied_by: str


class KPIs(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    monthly_budget: float
    total_plan_spend: float
    total_overage: float
    total_spend: float
    budget_used_percent: int
    active_alert_count: int
    potential_savings: float


class DashboardResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    providers: list[ProviderResponse]
    alerts: list[AlertResponse]
    kpis: KPIs


class PlanResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    provider_id: str
    provider_name: str
    name: str
    plan_type: str
    monthly_cost: float
    included_quota: float
    quota_unit: str
