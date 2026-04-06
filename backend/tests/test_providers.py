import pytest

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
async def test_update_provider_recomputes_remaining_and_usage_percent(auth_client, seeded_db):
    response = await auth_client.put(
        "/api/v1/providers/openai",
        json={"consumed": 80},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["consumed"] == 80
    assert body["remaining"] == 20
    assert body["usagePercent"] == 80


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
