from sqlalchemy import Column, String, Enum as SAEnum
from app.core.db import Base
from app.core.enums import AlertSeverity, AlertStatus


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)
    severity = Column(SAEnum(AlertSeverity), nullable=False)
    provider_id = Column(String, nullable=False)
    provider_name = Column(String, nullable=False)
    trigger_date = Column(String, nullable=False)
    description = Column(String, nullable=False)
    recommended_action = Column(String, nullable=False)
    status = Column(SAEnum(AlertStatus), nullable=False, default=AlertStatus.active)
