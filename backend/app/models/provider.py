from sqlalchemy import Column, String, Float, Integer, Enum as SAEnum
from app.core.db import Base
from app.core.enums import SyncStatus, DataOrigin, PlanType, RecommendationType, Urgency, Trend


class Provider(Base):
    __tablename__ = "providers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    logo = Column(String, nullable=False, default="")
    category = Column(String, nullable=False, default="")
    plan = Column(String, nullable=False, default="")
    plan_type = Column(SAEnum(PlanType), nullable=False)
    monthly_cost = Column(Float, nullable=False, default=0)
    included_quota = Column(Float, nullable=False, default=0)
    quota_unit = Column(String, nullable=False, default="")
    consumed = Column(Float, nullable=False, default=0)
    remaining = Column(Float, nullable=False, default=0)
    usage_percent = Column(Float, nullable=False, default=0)
    overage = Column(Float, nullable=False, default=0)
    reset_date = Column(String, nullable=False, default="")
    days_until_reset = Column(Integer, nullable=False, default=0)
    sync_status = Column(SAEnum(SyncStatus), nullable=False, default=SyncStatus.manual)
    last_sync = Column(String, nullable=False, default="")
    data_origin = Column(SAEnum(DataOrigin), nullable=False, default=DataOrigin.manual)
    recommendation = Column(SAEnum(RecommendationType), nullable=False, default=RecommendationType.maintain)
    recommendation_text = Column(String, nullable=False, default="")
    recommendation_detail = Column(String, nullable=False, default="")
    savings = Column(String, nullable=True)
    urgency = Column(SAEnum(Urgency), nullable=False, default=Urgency.low)
    projected_end_of_cycle = Column(Float, nullable=False, default=0)
    trend = Column(SAEnum(Trend), nullable=False, default=Trend.stable)
