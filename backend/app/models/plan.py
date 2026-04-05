from sqlalchemy import Column, String, Float, Enum as SAEnum
from app.core.db import Base
from app.core.enums import PlanType


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True)
    provider_id = Column(String, nullable=False)
    provider_name = Column(String, nullable=False)
    name = Column(String, nullable=False)
    plan_type = Column(SAEnum(PlanType), nullable=False)
    monthly_cost = Column(Float, nullable=False)
    included_quota = Column(Float, nullable=False)
    quota_unit = Column(String, nullable=False)
