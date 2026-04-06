import pytest


@pytest.mark.asyncio
async def test_list_alerts_success(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/alerts")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0]["id"] == "alert-1"


@pytest.mark.asyncio
async def test_list_alerts_requires_auth(client, seeded_db):
    response = await client.get("/api/v1/alerts")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_alerts_validation_errors(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/alerts?limit=0")
    assert response.status_code == 422
