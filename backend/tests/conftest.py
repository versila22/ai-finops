import os
from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("JWT_SECRET", "test-secret")

from app import auth as auth_module
from app.auth import create_access_token, create_user
from app.core.config import settings
from app.core.db import Base, get_db
from app.main import app
from app.models.adjustment import ManualAdjustment
from app.models.alert import Alert
from app.models.plan import Plan
from app.models.provider import Provider
from app.models.settings import Settings


TEST_DATABASE_URL = "sqlite://"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def seeded_db(db_session):
    provider_openai = Provider(
        id="openai",
        name="OpenAI",
        logo="O",
        category="LLM / API",
        plan="API Pay-as-you-go",
        plan_type="monthly_quota",
        monthly_cost=50,
        included_quota=100,
        quota_unit="USD",
        consumed=25,
        remaining=75,
        usage_percent=25,
        overage=5,
        reset_date="2026-04-30",
        days_until_reset=20,
        sync_status="manual",
        last_sync="",
        data_origin="manual",
        recommendation="maintain",
        recommendation_text="Well-sized plan",
        recommendation_detail="Looks fine",
        savings="~€12/mo",
        urgency="low",
        projected_end_of_cycle=40,
        trend="stable",
    )
    provider_google = Provider(
        id="google",
        name="Google / Gemini",
        logo="G",
        category="LLM / Cloud AI",
        plan="One AI Premium",
        plan_type="monthly_quota",
        monthly_cost=21.99,
        included_quota=1000,
        quota_unit="credits",
        consumed=600,
        remaining=400,
        usage_percent=60,
        overage=0,
        reset_date="2026-04-30",
        days_until_reset=20,
        sync_status="manual",
        last_sync="",
        data_origin="manual",
        recommendation="watch",
        recommendation_text="Monitor",
        recommendation_detail="Moderate usage",
        savings=None,
        urgency="medium",
        projected_end_of_cycle=800,
        trend="up",
    )

    db_session.add_all(
        [
            provider_openai,
            provider_google,
            Plan(
                id="plan-1",
                provider_id="openai",
                provider_name="OpenAI",
                name="API Pay-as-you-go",
                plan_type="monthly_quota",
                monthly_cost=50,
                included_quota=100,
                quota_unit="USD",
            ),
            Plan(
                id="plan-2",
                provider_id="google",
                provider_name="Google / Gemini",
                name="One AI Premium",
                plan_type="monthly_quota",
                monthly_cost=21.99,
                included_quota=1000,
                quota_unit="credits",
            ),
            Alert(
                id="alert-1",
                type="Quota warning",
                severity="warning",
                provider_id="openai",
                provider_name="OpenAI",
                trigger_date="2026-04-06",
                description="Usage above threshold",
                recommended_action="Review usage",
                status="active",
            ),
            Alert(
                id="alert-2",
                type="FYI",
                severity="info",
                provider_id="google",
                provider_name="Google / Gemini",
                trigger_date="2026-04-06",
                description="Just info",
                recommended_action="No action",
                status="resolved",
            ),
            ManualAdjustment(
                id="adj-1",
                provider_id="openai",
                provider_name="OpenAI",
                type="credit",
                amount=10,
                note="Manual fix",
                date="2026-04-06",
                applied_by="Admin",
            ),
            Settings(
                id="global",
                monthly_budget=200,
                alert_threshold_warning=75,
                alert_threshold_critical=90,
                currency="EUR",
            ),
        ]
    )
    db_session.commit()
    return db_session


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def override_dependencies(db_session, monkeypatch):
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass

    monkeypatch.setattr(auth_module, "hash_password", lambda password: f"hashed::{password}")
    monkeypatch.setattr(
        auth_module,
        "verify_password",
        lambda plain_password, hashed_password: hashed_password == f"hashed::{plain_password}",
    )

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()


@pytest_asyncio.fixture()
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture()
def test_user(db_session):
    return create_user(db_session, "user@example.com", "password123")


@pytest_asyncio.fixture()
async def auth_client(client, test_user):
    token = create_access_token(test_user.email)
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield client
    client.headers.pop("Authorization", None)


@pytest.fixture()
def auth_headers(test_user):
    token = create_access_token(test_user.email)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def expired_token(test_user):
    payload = {
        "sub": test_user.email,
        "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
