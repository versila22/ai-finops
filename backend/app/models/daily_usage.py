from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.sql import func

from app.core.db import Base


class DailyUsage(Base):
    __tablename__ = "daily_usage"
    __table_args__ = (
        UniqueConstraint("provider_id", "date", name="uq_daily_usage_provider_date"),
    )

    id = Column(String, primary_key=True)
    provider_id = Column(String, ForeignKey("providers.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    cost_usd = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
