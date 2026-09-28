import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify system health endpoint and MySQL connectivity."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["app_name"] == "AI-CareerMatch"


def test_admin_seed_login():
    """Verify login with the seeded administrator account."""
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@aicareermatch.com", "password": "Admin@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"
    assert data["email"] == "admin@aicareermatch.com"


def test_invalid_login_credentials():
    """Verify login rejection with incorrect password."""
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@aicareermatch.com", "password": "WrongPassword999"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_student_registration_and_authentication():
    """Verify complete registration, duplicate guard, and authenticated profile access."""
    test_email = "student.test.unit@example.com"
    test_password = "SecureStudentPass123"

    # 1. Register new student
    reg_response = client.post(
        "/api/auth/register",
        json={
            "email": test_email,
            "password": test_password,
            "full_name": "Test Engineering Student",
            "phone": "+91 9876543210",
            "role": "student"
        }
    )
    # 201 Created or 400 if already created in a previous test run
    assert reg_response.status_code in [201, 400]

    # 2. Duplicate registration attempt must fail
    dup_response = client.post(
        "/api/auth/register",
        json={
            "email": test_email,
            "password": test_password,
            "full_name": "Duplicate Student Attempt"
        }
    )
    assert dup_response.status_code == 400

    # 3. Authenticate with newly registered account
    login_response = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    token = token_data["access_token"]
    assert token_data["role"] == "student"

    # 4. Access protected profile route with bearer token
    profile_response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_response.status_code == 200
    profile = profile_response.json()
    assert profile["email"] == test_email
    assert profile["full_name"] == "Test Engineering Student"
    assert profile["role"] == "student"

    # 5. Access without token must fail with 401 Unauthorized
    unauth_response = client.get("/api/users/me")
    assert unauth_response.status_code == 401
