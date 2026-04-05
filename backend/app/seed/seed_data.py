"""Seed the database with mock data matching the frontend mockData.ts."""
from app.core.db import SessionLocal, create_tables
from app.models.provider import Provider
from app.models.alert import Alert
from app.models.plan import Plan
from app.models.adjustment import ManualAdjustment
from app.models.settings import Settings


def seed():
    create_tables()
    db = SessionLocal()

    # Skip if already seeded
    if db.query(Provider).count() > 0:
        print("Database already seeded, skipping.")
        db.close()
        return

    # --- Providers ---
    providers = [
        Provider(
            id="openai",
            name="OpenAI",
            logo="O",
            category="LLM / API",
            plan="Pro + API",
            plan_type="monthly_quota",
            monthly_cost=220,
            included_quota=10000000,
            quota_unit="tokens",
            consumed=8200000,
            remaining=1800000,
            usage_percent=82,
            overage=0,
            reset_date="2026-04-30",
            days_until_reset=26,
            sync_status="synced",
            last_sync="2026-04-04T08:30:00Z",
            data_origin="auto",
            recommendation="watch",
            recommendation_text="Quota exhaustion risk",
            recommendation_detail="At 82% usage with 26 days remaining. Current pace projects 100% by Apr 18. Consider upgrading next cycle or throttling non-critical workloads.",
            urgency="high",
            projected_end_of_cycle=158,
            trend="up",
        ),
        Provider(
            id="anthropic",
            name="Anthropic",
            logo="A",
            category="LLM / API",
            plan="API Usage",
            plan_type="monthly_quota",
            monthly_cost=150,
            included_quota=5000000,
            quota_unit="tokens",
            consumed=2250000,
            remaining=2750000,
            usage_percent=45,
            overage=0,
            reset_date="2026-04-30",
            days_until_reset=26,
            sync_status="synced",
            last_sync="2026-04-04T08:25:00Z",
            data_origin="auto",
            recommendation="maintain",
            recommendation_text="Well-sized plan",
            recommendation_detail="Healthy usage at 45% with 26 days remaining. Pace is sustainable and plan is appropriately sized.",
            urgency="low",
            projected_end_of_cycle=84,
            trend="stable",
        ),
        Provider(
            id="google",
            name="Google AI / Vertex",
            logo="G",
            category="LLM / Cloud AI",
            plan="Prepaid Credits",
            plan_type="prepaid_credits",
            monthly_cost=500,
            included_quota=500,
            quota_unit="EUR credits",
            consumed=90,
            remaining=410,
            usage_percent=18,
            overage=0,
            reset_date="2026-06-30",
            days_until_reset=87,
            sync_status="synced",
            last_sync="2026-04-04T07:00:00Z",
            data_origin="auto",
            recommendation="downgrade",
            recommendation_text="Underused credit pack",
            recommendation_detail="Only 18% of €500 prepaid credits consumed. At current pace, ~€320 will expire unused. Consider a €200 pack next cycle.",
            savings="~€300",
            urgency="medium",
            projected_end_of_cycle=34,
            trend="down",
        ),
        Provider(
            id="elevenlabs",
            name="ElevenLabs",
            logo="E",
            category="Voice AI",
            plan="Scale Plan",
            plan_type="monthly_quota",
            monthly_cost=99,
            included_quota=2000000,
            quota_unit="characters",
            consumed=2340000,
            remaining=0,
            usage_percent=117,
            overage=47,
            reset_date="2026-04-28",
            days_until_reset=24,
            sync_status="pending",
            last_sync="2026-04-03T22:00:00Z",
            data_origin="auto",
            recommendation="upgrade",
            recommendation_text="Upgrade to stop overage",
            recommendation_detail="€47 overage this cycle from 340K excess characters. Pro plan at €149/mo includes 4M characters — would eliminate overage and save ~€30/mo net.",
            savings="~€30/mo",
            urgency="high",
            projected_end_of_cycle=175,
            trend="up",
        ),
        Provider(
            id="lovable",
            name="Lovable",
            logo="L",
            category="AI Dev Platform",
            plan="Teams Plan",
            plan_type="monthly_quota",
            monthly_cost=100,
            included_quota=5000,
            quota_unit="messages",
            consumed=3000,
            remaining=2000,
            usage_percent=60,
            overage=0,
            reset_date="2026-04-30",
            days_until_reset=26,
            sync_status="manual",
            last_sync="2026-04-02T10:00:00Z",
            data_origin="adjusted",
            recommendation="maintain",
            recommendation_text="Plan OK — manual tracking",
            recommendation_detail="Usage at 60% with manual adjustments. Auto-sync unavailable — data may lag. Plan size is appropriate.",
            urgency="low",
            projected_end_of_cycle=92,
            trend="stable",
        ),
    ]
    db.add_all(providers)

    # --- Alerts ---
    alerts = [
        Alert(
            id="a1",
            type="High Usage",
            severity="warning",
            provider_id="openai",
            provider_name="OpenAI",
            trigger_date="2026-04-03",
            description="OpenAI usage at 82% of monthly quota with 26 days remaining.",
            recommended_action="Monitor daily pace. Upgrade if projected to exceed by Apr 15.",
            status="active",
        ),
        Alert(
            id="a2",
            type="Overage",
            severity="critical",
            provider_id="elevenlabs",
            provider_name="ElevenLabs",
            trigger_date="2026-04-02",
            description="ElevenLabs exceeded quota — 340K excess characters. Overage: €47.",
            recommended_action="Upgrade to Pro plan to eliminate recurring overage.",
            status="active",
        ),
        Alert(
            id="a3",
            type="Underused Plan",
            severity="info",
            provider_id="google",
            provider_name="Google AI / Vertex",
            trigger_date="2026-04-01",
            description="Google prepaid credits at 18% — €410 at risk of expiring unused.",
            recommended_action="Switch to smaller credit pack or redistribute AI workloads to Google.",
            status="active",
        ),
        Alert(
            id="a4",
            type="Sync Issue",
            severity="warning",
            provider_id="elevenlabs",
            provider_name="ElevenLabs",
            trigger_date="2026-04-04",
            description="ElevenLabs sync pending for 6+ hours.",
            recommended_action="Verify API key and retry sync.",
            status="active",
        ),
        Alert(
            id="a5",
            type="Manual Mode",
            severity="info",
            provider_id="lovable",
            provider_name="Lovable",
            trigger_date="2026-03-28",
            description="Lovable running in manual data mode. Auto-sync disabled.",
            recommended_action="Re-enable auto-sync or ensure manual entries are current.",
            status="active",
        ),
        Alert(
            id="a6",
            type="Budget Threshold",
            severity="warning",
            provider_id="openai",
            provider_name="OpenAI",
            trigger_date="2026-03-15",
            description="Monthly spend exceeded 75% of budget at mid-cycle.",
            recommended_action="Reviewed and adjusted budget allocation.",
            status="resolved",
        ),
    ]
    db.add_all(alerts)

    # --- Manual Adjustments ---
    adjustments = [
        ManualAdjustment(
            id="m1",
            provider_id="lovable",
            provider_name="Lovable",
            type="Credit Adjustment",
            amount=-200,
            note="Corrected duplicate message count from failed session",
            date="2026-04-02",
            applied_by="Admin",
        ),
        ManualAdjustment(
            id="m2",
            provider_id="lovable",
            provider_name="Lovable",
            type="Usage Override",
            amount=150,
            note="Added team member usage from separate workspace",
            date="2026-03-28",
            applied_by="Admin",
        ),
        ManualAdjustment(
            id="m3",
            provider_id="openai",
            provider_name="OpenAI",
            type="Cost Correction",
            amount=-12,
            note="Billing credit applied for API downtime on March 20",
            date="2026-03-22",
            applied_by="Admin",
        ),
    ]
    db.add_all(adjustments)

    # --- Plans ---
    plans = [
        Plan(id="p1", provider_id="openai", provider_name="OpenAI", name="Pro + API", plan_type="monthly_quota", monthly_cost=220, included_quota=10000000, quota_unit="tokens"),
        Plan(id="p2", provider_id="anthropic", provider_name="Anthropic", name="API Usage", plan_type="monthly_quota", monthly_cost=150, included_quota=5000000, quota_unit="tokens"),
        Plan(id="p3", provider_id="google", provider_name="Google AI / Vertex", name="Prepaid Credits", plan_type="prepaid_credits", monthly_cost=500, included_quota=500, quota_unit="EUR credits"),
        Plan(id="p4", provider_id="elevenlabs", provider_name="ElevenLabs", name="Scale Plan", plan_type="monthly_quota", monthly_cost=99, included_quota=2000000, quota_unit="characters"),
        Plan(id="p5", provider_id="lovable", provider_name="Lovable", name="Teams Plan", plan_type="monthly_quota", monthly_cost=100, included_quota=5000, quota_unit="messages"),
    ]
    db.add_all(plans)

    # --- Settings ---
    settings = Settings(
        id="global",
        monthly_budget=1200,
        alert_threshold_warning=75,
        alert_threshold_critical=90,
        currency="EUR",
    )
    db.add(settings)

    db.commit()
    db.close()
    print("Database seeded successfully!")


if __name__ == "__main__":
    seed()
