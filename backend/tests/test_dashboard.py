import pytest


@pytest.mark.asyncio
async def test_dashboard_returns_aggregated_data(auth_client, seeded_db):
    response = await auth_client.get("/api/v1/dashboard")

    assert response.status_code == 200
    body = response.json()
    assert len(body["providers"]) == 2
    assert len(body["alerts"]) == 2
    assert body["kpis"] == {
        "monthlyBudget": 200.0,
        "totalPlanSpend": 71.99,
        "totalOverage": 5.0,
        "totalSpend": 76.99,
        "budgetUsedPercent": 38,
        "activeAlertCount": 1,
        "potentialSavings": 12.0,
    }


@pytest.mark.asyncio
async def test_dashboard_requires_auth(client, seeded_db):
    response = await client.get("/api/v1/dashboard")
    assert response.status_code == 401
