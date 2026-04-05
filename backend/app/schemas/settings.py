from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional


class SettingsResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    monthly_budget: float
    alert_threshold_warning: int
    alert_threshold_critical: int
    currency: str


class SettingsUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    monthly_budget: Optional[float] = None
    alert_threshold_warning: Optional[int] = None
    alert_threshold_critical: Optional[int] = None
    currency: Optional[str] = None
