import pytest


@pytest.mark.asyncio
async def test_get_settings_success(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/settings")

    assert response.status_code == 200
    assert response.json() == {
        "id": "global",
        "monthlyBudget": 200.0,
        "alertThresholdWarning": 75,
        "alertThresholdCritical": 90,
        "currency": "EUR",
    }


@pytest.mark.asyncio
async def test_get_settings_requires_auth(client, seeded_db):
    response = await client.get("/api/v1/settings")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_settings_not_found(auth_client):
    response = await auth_client.get("/api/v1/settings")
    assert response.status_code == 404
    assert response.json()["detail"] == "Settings not found"


@pytest.mark.asyncio
async def test_update_settings_success(auth_client, seeded_db):
    response = await auth_client.put(
        "/api/v1/settings",
        json={"monthlyBudget": 250, "currency": "USD"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["monthlyBudget"] == 250.0
    assert body["currency"] == "USD"
    assert body["alertThresholdWarning"] == 75


@pytest.mark.asyncio
async def test_update_settings_invalid_payload_returns_422(auth_client, seeded_db):
    response = await auth_client.put(
        "/api/v1/settings",
        json={"monthlyBudget": {"bad": "value"}},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_settings_not_found(auth_client):
    response = await auth_client.put(
        "/api/v1/settings",
        json={"monthlyBudget": 250},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Settings not found"
