from typing import Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


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


class ProviderCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: str
    logo: str = ""
    category: str = "LLM / API"
    plan: str
    plan_type: str = "monthly_quota"
    monthly_cost: float
    included_quota: float = 0
    quota_unit: str = "tokens"
    reset_date: str = ""
    days_until_reset: int = 30
    consumed: float = 0
    sync_status: str = "manual"
    data_origin: str = "manual"


class ProviderUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: Optional[str] = None
    logo: Optional[str] = None
    category: Optional[str] = None
    plan: Optional[str] = None
    plan_type: Optional[str] = None
    monthly_cost: Optional[float] = None
    included_quota: Optional[float] = None
    quota_unit: Optional[str] = None
    reset_date: Optional[str] = None
    days_until_reset: Optional[int] = None
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
    projected_end_of_cycle: Optional[float] = None
    trend: Optional[str] = None
