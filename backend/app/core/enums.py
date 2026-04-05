import enum


class SyncStatus(str, enum.Enum):
    synced = "synced"
    pending = "pending"
    error = "error"
    manual = "manual"


class DataOrigin(str, enum.Enum):
    auto = "auto"
    manual = "manual"
    adjusted = "adjusted"


class PlanType(str, enum.Enum):
    monthly_quota = "monthly_quota"
    prepaid_credits = "prepaid_credits"


class RecommendationType(str, enum.Enum):
    maintain = "maintain"
    downgrade = "downgrade"
    upgrade = "upgrade"
    watch = "watch"
    review = "review"


class AlertSeverity(str, enum.Enum):
    critical = "critical"
    warning = "warning"
    info = "info"


class AlertStatus(str, enum.Enum):
    active = "active"
    resolved = "resolved"


class Urgency(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class Trend(str, enum.Enum):
    up = "up"
    down = "down"
    stable = "stable"
