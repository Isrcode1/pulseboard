import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "pulseboard-auth"
    assert data["status"] == "running"


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "pulseboard-auth"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_verify_invalid_token():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/auth/verify?token=invalidtoken")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_github_login_redirect():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        follow_redirects=False,
    ) as client:
        response = await client.get("/auth/github/login")
    assert response.status_code in [302, 307]
    assert "github.com/login/oauth/authorize" in response.headers["location"]
