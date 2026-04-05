from sqlalchemy import Column, String, Float
from app.core.db import Base


class ManualAdjustment(Base):
    __tablename__ = "manual_adjustments"

    id = Column(String, primary_key=True)
    provider_id = Column(String, nullable=False)
    provider_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    note = Column(String, nullable=False, default="")
    date = Column(String, nullable=False)
    applied_by = Column(String, nullable=False, default="Admin")
