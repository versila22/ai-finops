from sqlalchemy import Column, String, Float, Integer
from app.core.db import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default="global")
    monthly_budget = Column(Float, nullable=False, default=1200)
    alert_threshold_warning = Column(Integer, nullable=False, default=75)
    alert_threshold_critical = Column(Integer, nullable=False, default=90)
    currency = Column(String, nullable=False, default="EUR")
