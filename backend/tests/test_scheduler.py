
from datetime import datetime, timezone

from services.scheduler import (
    overlaps,
    find_antenna_conflicts,
    find_engineer_conflicts,
    find_maintenance_conflicts
)

def test_engineer_conflict():
    assignments = [
        {
            "engineer_id": 3,
            "scheduled_start": dt(10, 0),
            "scheduled_end": dt(10, 30)
        }
    ]

    conflicts = find_engineer_conflicts(
        engineer_id=3,
        start_time=dt(10, 15),
        end_time=dt(10, 45),
        existing_assignments=assignments
    )

    assert len(conflicts) == 1


def test_engineer_available():
    assignments = [
        {
            "engineer_id": 3,
            "scheduled_start": dt(10, 0),
            "scheduled_end": dt(10, 30)
        }
    ]

    conflicts = find_engineer_conflicts(
        engineer_id=3,
        start_time=dt(10, 30),
        end_time=dt(11, 0),
        existing_assignments=assignments
    )

    assert len(conflicts) == 0


def dt(hour, minute):
    return datetime(
        2026, 10, 25,
        hour, minute,
        tzinfo=timezone.utc
    )


def test_overlapping_times():
    assert overlaps(
        dt(10, 0), dt(10, 20),
        dt(10, 10), dt(10, 30)
    ) is True


def test_back_to_back_times():
    assert overlaps(
        dt(10, 0), dt(10, 20),
        dt(10, 20), dt(10, 40)
    ) is False


def test_antenna_conflict():
    existing_sessions = [
        {
            "session_id": 1,
            "antenna_id": 5,
            "scheduled_start": dt(10, 0),
            "scheduled_end": dt(10, 20)
        }
    ]

    conflicts = find_antenna_conflicts(
        antenna_id=5,
        start_time=dt(10, 10),
        end_time=dt(10, 30),
        existing_sessions=existing_sessions
    )

    assert len(conflicts) == 1


def test_different_antenna():
    existing_sessions = [
        {
            "session_id": 1,
            "antenna_id": 5,
            "scheduled_start": dt(10, 0),
            "scheduled_end": dt(10, 20)
        }
    ]

    conflicts = find_antenna_conflicts(
        antenna_id=6,
        start_time=dt(10, 10),
        end_time=dt(10, 30),
        existing_sessions=existing_sessions
    )

    assert len(conflicts) == 0

def test_maintenance_conflict():
    maintenance_periods = [
        {
            "antenna_id": 5,
            "start_time": dt(10, 0),
            "end_time": dt(11, 0)
        }
    ]

    conflicts = find_maintenance_conflicts(
        antenna_id=5,
        start_time=dt(10, 30),
        end_time=dt(10, 45),
        maintenance_periods=maintenance_periods
    )

    assert len(conflicts) == 1


def test_no_maintenance_conflict():
    maintenance_periods = [
        {
            "antenna_id": 5,
            "start_time": dt(10, 0),
            "end_time": dt(11, 0)
        }
    ]

    conflicts = find_maintenance_conflicts(
        antenna_id=5,
        start_time=dt(11, 0),
        end_time=dt(11, 30),
        maintenance_periods=maintenance_periods
    )

    assert len(conflicts) == 0
