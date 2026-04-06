import pytest


@pytest.mark.asyncio
async def test_register_user_success(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "new@example.com", "password": "secret123"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new@example.com"
    assert "id" in body


@pytest.mark.asyncio
async def test_register_user_invalid_email_returns_422(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "secret123"},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_duplicate_user_returns_400(client, test_user):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": test_user.email, "password": "secret123"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "User already exists"


@pytest.mark.asyncio
async def test_login_success_returns_token_and_user(client, test_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "password123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tokenType"] == "bearer"
    assert body["accessToken"]
    assert body["user"]["email"] == test_user.email


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client, test_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_invalid_payload_returns_422(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "bad-email", "password": "password123"},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_protected_route_requires_token(client):
    response = await client.get("/api/v1/health")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_accepts_valid_token(auth_client, test_user):
    response = await auth_client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "0.1.0", "user": test_user.email}


@pytest.mark.asyncio
async def test_expired_token_is_rejected(client, expired_token):
    response = await client.get(
        "/api/v1/health",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"
