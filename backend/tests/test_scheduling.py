
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app
from auth import require_booking_access
client = TestClient(app)

@pytest.fixture(autouse=True)
def authenticated_test_user():
    """Simulate an authenticated Admin for scheduling tests."""

    app.dependency_overrides[require_booking_access] = lambda: {
        "user_id": 1,
        "user_name": "Test Admin",
        "role": "Admin"
    }

    yield

    # Remove the override after each test.
    app.dependency_overrides.pop(require_booking_access, None)


def valid_payload():
    return {
        "window_id": 1,
        "antenna_id": 1,
        "station_id": 1,
        "frequency": 1,
        "scheduled_start": "2026-10-25T09:05:00",
        "scheduled_end": "2026-10-25T09:10:00"
    }


def mock_database(
    window=None,
    antenna=None,
    sessions=None,
    maintenance=None,
    frequency=None
):
    if window is None:
        window = {
            "window_id": 1,
            "start_time": datetime(2026, 10, 25, 9, 0),
            "end_time": datetime(2026, 10, 25, 9, 15),
            "groundstation_id": 1
        }

    if antenna is None:
        antenna = {
            "antenna_id": 1,
            "station_id": 1,
            "status": "Active"
        }

    if frequency is None:
        frequency = {
            "frequency_id": 1,
            "availability_status": "Available"
        }

    cursor = MagicMock()

    # fetchone() calls:
    # 1. Window
    # 2. Antenna
    # 3. Maintenance
    # 4. Frequency
    # 5. INSERT ... RETURNING
    cursor.fetchone.side_effect = [
        window,
        antenna,
        maintenance,
        frequency,
        {"request_id": 1, "status": "Pending"}
    ]

    cursor.fetchall.return_value = (
        sessions if sessions is not None else []
    )

    connection = MagicMock()
    connection.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor

    return connection


def post_with_database(payload, connection):
    with patch(
        "routers.scheduling.get_connection",
        return_value=connection
    ):
        return client.post(
            "/scheduling/sessions",
            json=payload
        )


def test_valid_request():
    response = post_with_database(
        valid_payload(),
        mock_database()
    )

    assert response.status_code == 201
    assert response.json()["booking_created"] is False
    assert response.json()["status"] == "Pending"
    assert response.json()["request_id"] == 1


def test_invalid_antenna():
    payload = valid_payload()
    payload["antenna_id"] = -1

    response = client.post(
        "/scheduling/sessions",
        json=payload
    )

    assert response.status_code == 422


def test_invalid_time():
    payload = valid_payload()
    payload["scheduled_end"] = "2026-10-25T08:30:00"

    response = client.post(
        "/scheduling/sessions",
        json=payload
    )

    assert response.status_code == 422


def test_missing_station():
    payload = valid_payload()
    del payload["station_id"]

    response = client.post(
        "/scheduling/sessions",
        json=payload
    )

    assert response.status_code == 422


def test_invalid_frequency():
    payload = valid_payload()
    payload["frequency"] = 0

    response = client.post(
        "/scheduling/sessions",
        json=payload
    )

    assert response.status_code == 422


def test_outside_communication_window():
    payload = valid_payload()
    payload["scheduled_start"] = "2026-10-25T09:15:00"
    payload["scheduled_end"] = "2026-10-25T09:20:00"

    response = post_with_database(
        payload,
        mock_database()
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Session must be within communication window"
    )


def test_antenna_conflict():
    existing_session = {
        "session_id": 1,
        "antenna_id": 1,
        "scheduled_start": datetime(2026, 10, 25, 9, 0),
        "scheduled_end": datetime(2026, 10, 25, 9, 15)
    }

    response = post_with_database(
        valid_payload(),
        mock_database(sessions=[existing_session])
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Antenna is already booked during this time"
    )


def test_maintenance_conflict():
    response = post_with_database(
        valid_payload(),
        mock_database(maintenance={"maintenance_id": 1})
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Antenna is under scheduled maintenance"
    )


def test_inactive_antenna():
    response = post_with_database(
        valid_payload(),
        mock_database(
            antenna={
                "antenna_id": 1,
                "station_id": 1,
                "status": "Maintenance"
            }
        )
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Antenna is not active"


def test_invalid_window():
    connection = mock_database()

    cursor = (
        connection.cursor.return_value
        .__enter__.return_value
    )

    cursor.fetchone.side_effect = [None]

    response = post_with_database(
        valid_payload(),
        connection
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Communication window not found"
    )
