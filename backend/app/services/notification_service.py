from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.provider import Provider
from app.models.settings import Settings


UNDERUSED_THRESHOLD = 30


ALERT_DEFINITIONS = {
    "high_usage": {
        "type": "High Usage",
        "severity": "warning",
    },
    "overage": {
        "type": "Overage",
        "severity": "critical",
    },
    "underused": {
        "type": "Underused Plan",
        "severity": "info",
    },
}


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _existing_active_alert(db: Session, provider_id: str, alert_type: str) -> Alert | None:
    return (
        db.query(Alert)
        .filter_by(provider_id=provider_id, type=alert_type, status="active")
        .first()
    )


def _create_alert(
    db: Session,
    *,
    provider: Provider,
    alert_type: str,
    severity: str,
    description: str,
    recommended_action: str,
) -> Alert:
    alert = Alert(
        id=str(uuid4()),
        type=alert_type,
        severity=severity,
        provider_id=provider.id,
        provider_name=provider.name,
        trigger_date=_today(),
        description=description,
        recommended_action=recommended_action,
        status="active",
    )
    db.add(alert)
    return alert


def check_and_notify_alerts(db: Session) -> list[Alert]:
    settings = db.query(Settings).filter_by(id="global").first()
    warning_threshold = settings.alert_threshold_warning if settings else 80
    critical_threshold = settings.alert_threshold_critical if settings else 90
    providers = db.query(Provider).all()
    new_alerts: list[Alert] = []

    for provider in providers:
        if provider.usage_percent >= warning_threshold and provider.overage <= 0:
            definition = ALERT_DEFINITIONS["high_usage"]
            severity = "critical" if provider.usage_percent >= critical_threshold else definition["severity"]
            if not _existing_active_alert(db, provider.id, definition["type"]):
                new_alerts.append(_create_alert(
                    db,
                    provider=provider,
                    alert_type=definition["type"],
                    severity=severity,
                    description=(
                        f"{provider.name} usage is at {provider.usage_percent}% with "
                        f"{provider.days_until_reset} days remaining."
                    ),
                    recommended_action="Review consumption trend and consider plan changes if usage keeps rising.",
                ))

        if provider.overage > 0:
            definition = ALERT_DEFINITIONS["overage"]
            if not _existing_active_alert(db, provider.id, definition["type"]):
                new_alerts.append(_create_alert(
                    db,
                    provider=provider,
                    alert_type=definition["type"],
                    severity=definition["severity"],
                    description=f"{provider.name} has an active overage of €{provider.overage} this cycle.",
                    recommended_action="Review the subscription and upgrade or cap usage to avoid recurring overage.",
                ))

        if provider.usage_percent < UNDERUSED_THRESHOLD:
            definition = ALERT_DEFINITIONS["underused"]
            if not _existing_active_alert(db, provider.id, definition["type"]):
                new_alerts.append(_create_alert(
                    db,
                    provider=provider,
                    alert_type=definition["type"],
                    severity=definition["severity"],
                    description=(
                        f"{provider.name} is only using {provider.usage_percent}% of the available quota."
                    ),
                    recommended_action="Review plan sizing and consider downgrading or reallocating workloads.",
                ))

    if new_alerts:
        db.commit()
        for alert in new_alerts:
            db.refresh(alert)

    return new_alerts
