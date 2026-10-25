
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from auth import require_admin
from main import app


client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_admin():
    app.dependency_overrides[require_admin] = lambda: {
        "user_id": 1,
        "user_name": "Test Admin",
        "role": "Admin"
    }

    yield

    app.dependency_overrides.pop(require_admin, None)


def pending_booking():
    return {
        "request_id": 10,
        "status": "Pending",
        "window_id": 4,
        "antenna_id": 1,
        "station_id": 1,
        "frequency": 1,
        "scheduled_start": datetime(2026, 10, 26, 9, 5),
        "scheduled_end": datetime(2026, 10, 26, 9, 15)
    }


def mock_database(fetchone_results):
    cursor = MagicMock()
    cursor.fetchone.side_effect = fetchone_results

    connection = MagicMock()
    connection.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor

    return connection, cursor


def test_admin_approves_pending_booking():
    connection, cursor = mock_database([
        pending_booking(),
        {
            "antenna_id": 1,
            "station_id": 1,
            "status": "Active"
        },
        {
            "start_time": datetime(2026, 10, 26, 9, 0),
            "end_time": datetime(2026, 10, 26, 9, 30),
            "groundstation_id": 1
        },
        None,  # No confirmed-session conflict
        None,  # No maintenance conflict
        {"availability_status": "Available"},
        {"session_id": 25}
    ])

    with patch(
        "routers.approvals.get_connection",
        return_value=connection
    ):
        response = client.post("/approvals/10/approve")

    assert response.status_code == 200
    assert response.json()["status"] == "Approved"
    assert response.json()["session_id"] == 25
    assert response.json()["reviewed_by"] == 1

    queries = [
        call.args[0]
        for call in cursor.execute.call_args_list
    ]

    assert any(
        "INSERT INTO public.communication_session" in query
        for query in queries
    )

    assert any(
        "UPDATE public.booking_request" in query
        for query in queries
    )


def test_duplicate_approval_is_blocked():
    booking = pending_booking()
    booking["status"] = "Approved"

    connection, cursor = mock_database([booking])

    with patch(
        "routers.approvals.get_connection",
        return_value=connection
    ):
        response = client.post("/approvals/10/approve")

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Only pending requests can be approved"
    )

    assert cursor.execute.call_count == 1


def test_approval_nonexistent_request():
    connection, cursor = mock_database([None])

    with patch(
        "routers.approvals.get_connection",
        return_value=connection
    ):
        response = client.post("/approvals/999999/approve")

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Booking request not found"
    )


def test_admin_rejects_pending_booking():
    connection, cursor = mock_database([
        {
            "request_id": 10,
            "status": "Pending"
        }
    ])

    with patch(
        "routers.approvals.get_connection",
        return_value=connection
    ):
        response = client.post(
            "/approvals/10/reject",
            json={"reason": "  Ground station unavailable  "}
        )

    assert response.status_code == 200
    assert response.json()["status"] == "Rejected"
    assert response.json()["reviewed_by"] == 1
    assert response.json()["reason"] == (
        "Ground station unavailable"
    )

    queries = [
        call.args[0]
        for call in cursor.execute.call_args_list
    ]

    assert any(
        "UPDATE public.booking_request" in query
        for query in queries
    )

    assert not any(
        "INSERT INTO public.communication_session" in query
        for query in queries
    )


def test_duplicate_rejection_is_blocked():
    connection, cursor = mock_database([
        {
            "request_id": 10,
            "status": "Rejected"
        }
    ])

    with patch(
        "routers.approvals.get_connection",
        return_value=connection
    ):
        response = client.post(
            "/approvals/10/reject",
            json={"reason": "Duplicate rejection"}
        )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Only pending requests can be rejected"
    )

    assert cursor.execute.call_count == 1


def test_rejection_nonexistent_request():
    connection, cursor = mock_database([None])

    with patch(
        "routers.approvals.get_connection",
        return_value=connection
    ):
        response = client.post(
            "/approvals/999999/reject",
            json={"reason": "Request not found"}
        )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Booking request not found"
    )
