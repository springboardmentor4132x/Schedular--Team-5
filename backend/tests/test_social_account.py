from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_list_social_accounts():
    response = client.get("/social-accounts/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_connect_social_account():
    response = client.post("/social-accounts/", json={
        "platform": "instagram",
        "account_name": "test_user"
    })
    assert response.status_code == 200
    assert response.json()["platform"] == "instagram"

def test_connect_invalid_platform():
    response = client.post("/social-accounts/", json={
        "platform": "tiktok",
        "account_name": "test_user"
    })
    assert response.status_code == 422

def test_get_existing_account():
    response = client.get("/social-accounts/1")
    assert response.status_code == 200

def test_get_missing_account():
    response = client.get("/social-accounts/999")
    assert response.status_code == 404
    