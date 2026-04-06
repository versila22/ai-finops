from app.models.provider import Provider
from app.models.settings import Settings
from app.services.notification_service import check_and_notify_alerts


def test_notification_thresholds_use_settings_values(db_session):
    db_session.query(Provider).delete()
    db_session.query(Settings).delete()
    db_session.add(
        Settings(
            id="global",
            monthly_budget=200,
            alert_threshold_warning=60,
            alert_threshold_critical=85,
            currency="EUR",
        )
    )
    db_session.add(
        Provider(
            id="openai",
            name="OpenAI",
            logo="O",
            category="LLM / API",
            plan="API",
            plan_type="monthly_quota",
            monthly_cost=100,
            included_quota=100,
            quota_unit="USD",
            consumed=70,
            remaining=30,
            usage_percent=70,
            overage=0,
            reset_date="2026-04-30",
            days_until_reset=10,
            sync_status="manual",
            last_sync="",
            data_origin="manual",
            recommendation="watch",
            recommendation_text="Monitor",
            recommendation_detail="",
            savings=None,
            urgency="medium",
            projected_end_of_cycle=80,
            trend="up",
        )
    )
    db_session.commit()

    alerts = check_and_notify_alerts(db_session)

    assert len(alerts) == 1
    assert alerts[0].type == "High Usage"
    assert alerts[0].severity.value == "warning"


def test_notification_critical_threshold_escalates_severity(db_session):
    db_session.query(Provider).delete()
    db_session.query(Settings).delete()
    db_session.add(
        Settings(
            id="global",
            monthly_budget=200,
            alert_threshold_warning=60,
            alert_threshold_critical=85,
            currency="EUR",
        )
    )
    db_session.add(
        Provider(
            id="elevenlabs",
            name="ElevenLabs",
            logo="E",
            category="Voice AI",
            plan="Creator",
            plan_type="monthly_quota",
            monthly_cost=100,
            included_quota=100,
            quota_unit="chars",
            consumed=90,
            remaining=10,
            usage_percent=90,
            overage=0,
            reset_date="2026-04-30",
            days_until_reset=5,
            sync_status="manual",
            last_sync="",
            data_origin="manual",
            recommendation="upgrade",
            recommendation_text="Upgrade",
            recommendation_detail="",
            savings=None,
            urgency="high",
            projected_end_of_cycle=120,
            trend="up",
        )
    )
    db_session.commit()

    alerts = check_and_notify_alerts(db_session)

    assert len(alerts) == 1
    assert alerts[0].type == "High Usage"
    assert alerts[0].severity.value == "critical"
