
from unittest.mock import patch

from fastapi.testclient import TestClient

from auth import get_current_user
from main import app

client = TestClient(app)

BOOKING_PAYLOAD = {
    "window_id": 4,
    "antenna_id": 1,
    "station_id": 1,
    "frequency": 1,
    "scheduled_start": "2026-10-26T09:25:00",
    "scheduled_end": "2026-10-26T09:30:00"
}


def test_booking_requires_login():
    response = client.post(
        "/scheduling/sessions",
        json=BOOKING_PAYLOAD
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_approval_requires_login():
    response = client.post("/approvals/999999999/approve")

    assert response.status_code == 401


def test_rejection_requires_login():
    response = client.post(
        "/approvals/999999999/reject",
        json={"reason": "Authorization test"}
    )

    assert response.status_code == 401


def test_analyst_cannot_submit_booking():
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": 3,
        "user_name": "Test Analyst",
        "role": "Analyst"
    }

    try:
        response = client.post(
            "/scheduling/sessions",
            json=BOOKING_PAYLOAD
        )

        assert response.status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_operator_cannot_approve():
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": 2,
        "user_name": "Test Operator",
        "role": "Operator"
    }

    try:
        response = client.post("/approvals/999999999/approve")

        assert response.status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_operator_cannot_reject():
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": 2,
        "user_name": "Test Operator",
        "role": "Operator"
    }

    try:
        response = client.post(
            "/approvals/999999999/reject",
            json={"reason": "Authorization test"}
        )

        assert response.status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_user, None)
