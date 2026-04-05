from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional


class ProviderResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    name: str
    logo: str
    category: str
    plan: str
    plan_type: str
    monthly_cost: float
    included_quota: float
    quota_unit: str
    consumed: float
    remaining: float
    usage_percent: float
    overage: float
    reset_date: str
    days_until_reset: int
    sync_status: str
    last_sync: str
    data_origin: str
    recommendation: str
    recommendation_text: str
    recommendation_detail: str
    savings: Optional[str] = None
    urgency: str
    projected_end_of_cycle: float
    trend: str


class DailyUsageResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    date: str
    consumed: float
    cumulative: float


class ProviderDetailResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    provider: ProviderResponse
    daily_usage: list[DailyUsageResponse]


class ProviderUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: Optional[str] = None
    plan: Optional[str] = None
    monthly_cost: Optional[float] = None
    included_quota: Optional[float] = None
    quota_unit: Optional[str] = None
    consumed: Optional[float] = None
    remaining: Optional[float] = None
    usage_percent: Optional[float] = None
    overage: Optional[float] = None
    sync_status: Optional[str] = None
    data_origin: Optional[str] = None
    recommendation: Optional[str] = None
    recommendation_text: Optional[str] = None
    recommendation_detail: Optional[str] = None
    urgency: Optional[str] = None
