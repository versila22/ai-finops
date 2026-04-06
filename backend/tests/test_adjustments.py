import pytest


@pytest.mark.asyncio
async def test_list_adjustments_success(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/adjustments")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["id"] == "adj-1"


@pytest.mark.asyncio
async def test_list_adjustments_requires_auth(client, seeded_db):
    response = await client.get("/api/v1/adjustments")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_adjustments_validation_errors(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/adjustments?limit=999")
    assert response.status_code == 422
