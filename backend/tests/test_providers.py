import pytest

from app.models.plan import Plan
from app.models.provider import Provider


@pytest.mark.asyncio
async def test_list_providers_success(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/providers")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert {provider["id"] for provider in body} == {"openai", "google"}


@pytest.mark.asyncio
async def test_list_providers_requires_auth(client, seeded_db):
    response = await client.get("/api/v1/providers")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_provider_success(auth_client, seeded_db, db_session):
    response = await auth_client.post(
        "/api/v1/providers",
        json={
            "name": "Claude Console",
            "logo": "C",
            "category": "LLM / API",
            "plan": "Team",
            "planType": "monthly_quota",
            "monthlyCost": 49,
            "includedQuota": 100000,
            "quotaUnit": "tokens",
            "resetDate": "2026-05-01",
            "daysUntilReset": 25,
            "consumed": 5000,
            "syncStatus": "manual",
            "dataOrigin": "manual",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == "claude-console"
    assert body["remaining"] == 95000
    assert body["usagePercent"] == 5
    assert body["recommendation"] == "maintain"

    provider = db_session.query(Provider).filter_by(id="claude-console").first()
    assert provider is not None
    plan = db_session.query(Plan).filter_by(provider_id="claude-console").first()
    assert plan is not None
    assert plan.name == "Team"


@pytest.mark.asyncio
async def test_create_provider_duplicate_returns_409(auth_client, seeded_db):
    response = await auth_client.post(
        "/api/v1/providers",
        json={
            "name": "OpenAI",
            "plan": "Another plan",
            "monthlyCost": 10,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Provider already exists"


@pytest.mark.asyncio
async def test_get_provider_detail_success(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/providers/openai")

    assert response.status_code == 200
    body = response.json()
    assert body["provider"]["id"] == "openai"
    assert len(body["dailyUsage"]) == 4
    assert body["alerts"][0]["providerId"] == "openai"
    assert body["adjustments"][0]["providerId"] == "openai"


@pytest.mark.asyncio
async def test_get_provider_detail_not_found(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/providers/missing")

    assert response.status_code == 404
    assert response.json()["detail"] == "Provider not found"


@pytest.mark.asyncio
async def test_update_provider_recomputes_remaining_and_usage_percent(auth_client, seeded_db, db_session):
    response = await auth_client.put(
        "/api/v1/providers/openai",
        json={
            "name": "OpenAI Enterprise",
            "plan": "Enterprise",
            "includedQuota": 200,
            "consumed": 80,
            "monthlyCost": 150,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["consumed"] == 80
    assert body["remaining"] == 120
    assert body["usagePercent"] == 40
    assert body["name"] == "OpenAI Enterprise"
    assert body["plan"] == "Enterprise"

    plan = db_session.query(Plan).filter_by(provider_id="openai").first()
    assert plan is not None
    assert plan.provider_name == "OpenAI Enterprise"
    assert plan.name == "Enterprise"
    assert plan.monthly_cost == 150


@pytest.mark.asyncio
async def test_update_provider_invalid_payload_returns_422(auth_client, seeded_db):
    response = await auth_client.put(
        "/api/v1/providers/openai",
        json={"monthlyCost": [1, 2, 3]},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_provider_not_found(auth_client, seeded_db):
    response = await auth_client.put(
        "/api/v1/providers/missing",
        json={"consumed": 80},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Provider not found"


@pytest.mark.asyncio
async def test_delete_provider_success(auth_client, seeded_db, db_session):
    response = await auth_client.delete("/api/v1/providers/openai")

    assert response.status_code == 204
    assert db_session.query(Provider).filter_by(id="openai").first() is None
    assert db_session.query(Plan).filter_by(provider_id="openai").first() is None


@pytest.mark.asyncio
async def test_delete_provider_not_found(auth_client, seeded_db):
    response = await auth_client.delete("/api/v1/providers/missing")

    assert response.status_code == 404
    assert response.json()["detail"] == "Provider not found"


@pytest.mark.asyncio
async def test_sync_all_success_new_endpoint(auth_client, seeded_db, monkeypatch):
    async def fake_sync_all_providers(db):
        provider = db.query(Provider).filter_by(id="openai").first()
        provider.sync_status = "synced"
        db.commit()
        return [{"provider": "openai", "status": "synced"}]

    monkeypatch.setattr("app.api.v1.routes.providers.sync_all_providers", fake_sync_all_providers)

    response = await auth_client.post("/api/v1/sync/all")

    assert response.status_code == 200
    body = response.json()
    assert body["sync_results"] == [{"provider": "openai", "status": "synced"}]
    assert len(body["providers"]) == 2


@pytest.mark.asyncio
async def test_sync_provider_success_new_endpoint(auth_client, seeded_db, monkeypatch):
    async def fake_sync_provider_by_id(provider_id, db):
        provider = db.query(Provider).filter_by(id=provider_id).first()
        provider.sync_status = "synced"
        db.commit()
        return {"provider": provider_id, "status": "synced"}

    monkeypatch.setattr("app.api.v1.routes.providers.sync_provider_by_id", fake_sync_provider_by_id)

    response = await auth_client.post("/api/v1/sync/openai")

    assert response.status_code == 200
    body = response.json()
    assert body["sync_result"] == {"provider": "openai", "status": "synced"}
    assert body["provider"]["id"] == "openai"


@pytest.mark.asyncio
async def test_sync_provider_not_found(auth_client, seeded_db):
    response = await auth_client.post("/api/v1/sync/missing")

    assert response.status_code == 404
    assert response.json()["detail"] == "Provider not found"
