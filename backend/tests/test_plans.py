import pytest


@pytest.mark.asyncio
async def test_list_plans_success(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/plans")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert {plan["id"] for plan in body} == {"plan-1", "plan-2"}


@pytest.mark.asyncio
async def test_list_plans_requires_auth(client, seeded_db):
    response = await client.get("/api/v1/plans")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_plans_validation_errors(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/plans?offset=-1")
    assert response.status_code == 422
