
from datetime import datetime


def overlaps(start1, end1, start2, end2):
    """Check whether two time intervals overlap."""
    return start1 < end2 and end1 > start2


def find_antenna_conflicts(
    antenna_id: int,
    start_time: datetime,
    end_time: datetime,
    existing_sessions: list
):
    """Find overlapping sessions for an antenna."""

    conflicts = []

    for session in existing_sessions:
        if session["antenna_id"] != antenna_id:
            continue

        if overlaps(
            start_time,
            end_time,
            session["scheduled_start"],
            session["scheduled_end"]
        ):
            conflicts.append(session)

    return conflicts


def find_engineer_conflicts(
    engineer_id: int,
    start_time: datetime,
    end_time: datetime,
    existing_assignments: list
):
    """Find overlapping assignments for an engineer."""

    conflicts = []

    for assignment in existing_assignments:
        if assignment["engineer_id"] != engineer_id:
            continue

        if overlaps(
            start_time,
            end_time,
            assignment["scheduled_start"],
            assignment["scheduled_end"]
        ):
            conflicts.append(assignment)

    return conflicts

def find_maintenance_conflicts(
    antenna_id: int,
    start_time: datetime,
    end_time: datetime,
    maintenance_periods: list
):
    """Find antenna maintenance periods overlapping a session."""

    conflicts = []

    for maintenance in maintenance_periods:
        if maintenance["antenna_id"] != antenna_id:
            continue

        if overlaps(
            start_time,
            end_time,
            maintenance["start_time"],
            maintenance["end_time"]
        ):
            conflicts.append(maintenance)

    return conflicts
