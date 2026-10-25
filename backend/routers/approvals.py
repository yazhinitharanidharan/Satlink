
from fastapi import APIRouter, Depends, HTTPException
from psycopg import OperationalError, IntegrityError
from psycopg.rows import dict_row

from auth import require_admin
from db import get_connection

router = APIRouter(
    prefix="/approvals",
    tags=["Booking Approvals"]
)


@router.post("/{request_id}/approve")
def approve_booking(
    request_id: int,
    admin: dict = Depends(require_admin)
):
    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:

                # Lock this request to prevent double approval.
                cur.execute(
                    """
                    SELECT *
                    FROM public.booking_request
                    WHERE request_id = %s
                    FOR UPDATE
                    """,
                    (request_id,)
                )
                booking = cur.fetchone()

                if booking is None:
                    raise HTTPException(404, "Booking request not found")

                if booking["status"] != "Pending":
                    raise HTTPException(
                        409,
                        "Only pending requests can be approved"
                    )

                # Lock the antenna to serialize approvals for it.
                cur.execute(
                    """
                    SELECT antenna_id, station_id, status
                    FROM public.antenna
                    WHERE antenna_id = %s
                    FOR UPDATE
                    """,
                    (booking["antenna_id"],)
                )
                antenna = cur.fetchone()

                if antenna is None:
                    raise HTTPException(404, "Antenna not found")

                if antenna["station_id"] != booking["station_id"]:
                    raise HTTPException(
                        400,
                        "Antenna does not belong to station"
                    )

                if antenna["status"] != "Active":
                    raise HTTPException(409, "Antenna is not active")

                # Recheck the communication window.
                cur.execute(
                    """
                    SELECT start_time, end_time, groundstation_id
                    FROM public.communication_window
                    WHERE window_id = %s
                    """,
                    (booking["window_id"],)
                )
                window = cur.fetchone()

                if window is None:
                    raise HTTPException(
                        404,
                        "Communication window not found"
                    )

                if window["groundstation_id"] != booking["station_id"]:
                    raise HTTPException(
                        400,
                        "Station does not match communication window"
                    )

                if (
                    booking["scheduled_start"] < window["start_time"]
                    or booking["scheduled_end"] > window["end_time"]
                ):
                    raise HTTPException(
                        409,
                        "Booking is outside communication window"
                    )

                # Recheck confirmed-session conflicts.
                cur.execute(
                    """
                    SELECT session_id
                    FROM public.communication_session
                    WHERE antenna_id = %s
                      AND scheduled_start < %s
                      AND scheduled_end > %s
                    LIMIT 1
                    """,
                    (
                        booking["antenna_id"],
                        booking["scheduled_end"],
                        booking["scheduled_start"]
                    )
                )

                if cur.fetchone() is not None:
                    raise HTTPException(
                        409,
                        "Antenna is already booked during this time"
                    )

                # Recheck maintenance.
                cur.execute(
                    """
                    SELECT maintenance_id
                    FROM public.maintenance_log
                    WHERE antenna_id = %s
                      AND status IN ('Scheduled', 'In Progress')
                      AND scheduled_start IS NOT NULL
                      AND scheduled_end IS NOT NULL
                      AND scheduled_start < %s
                      AND scheduled_end > %s
                    LIMIT 1
                    """,
                    (
                        booking["antenna_id"],
                        booking["scheduled_end"],
                        booking["scheduled_start"]
                    )
                )

                if cur.fetchone() is not None:
                    raise HTTPException(
                        409,
                        "Antenna has a maintenance conflict"
                    )

                # Recheck frequency availability.
                cur.execute(
                    """
                    SELECT availability_status
                    FROM public.frequency_band
                    WHERE frequency_id = %s
                    """,
                    (booking["frequency"],)
                )
                frequency = cur.fetchone()

                if frequency is None:
                    raise HTTPException(404, "Frequency band not found")

                if frequency["availability_status"] != "Available":
                    raise HTTPException(
                        409,
                        "Frequency band is not available"
                    )

                # Create the confirmed session.
                cur.execute(
                    """
                    INSERT INTO public.communication_session (
                        window_id,
                        antenna_id,
                        station_id,
                        frequency,
                        scheduled_start,
                        scheduled_end
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING session_id
                    """,
                    (
                        booking["window_id"],
                        booking["antenna_id"],
                        booking["station_id"],
                        booking["frequency"],
                        booking["scheduled_start"],
                        booking["scheduled_end"]
                    )
                )
                session = cur.fetchone()

                # Mark the request approved.
                cur.execute(
                    """
                    UPDATE public.booking_request
                    SET status = 'Approved',
                        reviewed_at = CURRENT_TIMESTAMP,
                        reviewed_by = %s,
                        session_id = %s
                    WHERE request_id = %s
                    """,
                    (
                        admin["user_id"],
                        session["session_id"],
                        request_id
                    )
                )

        # Both changes commit together.
        return {
            "message": "Booking approved successfully",
            "request_id": request_id,
            "status": "Approved",
            "session_id": session["session_id"],
            "reviewed_by": admin["user_id"]
        }

    except OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is currently unavailable"
        )

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Booking approval violates a database constraint"
        )

from pydantic import BaseModel, Field


class RejectionRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


@router.post("/{request_id}/reject")
def reject_booking(
    request_id: int,
    rejection: RejectionRequest,
    admin: dict = Depends(require_admin)
):
    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:

                cur.execute(
                    """
                    SELECT request_id, status
                    FROM public.booking_request
                    WHERE request_id = %s
                    FOR UPDATE
                    """,
                    (request_id,)
                )

                booking = cur.fetchone()

                if booking is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Booking request not found"
                    )

                if booking["status"] != "Pending":
                    raise HTTPException(
                        status_code=409,
                        detail="Only pending requests can be rejected"
                    )

                cur.execute(
                    """
                    UPDATE public.booking_request
                    SET status = 'Rejected',
                        reviewed_at = CURRENT_TIMESTAMP,
                        reviewed_by = %s,
                        rejection_reason = %s
                    WHERE request_id = %s
                    """,
                    (
                        admin["user_id"],
                        rejection.reason.strip(),
                        request_id
                    )
                )

        return {
            "message": "Booking request rejected",
            "request_id": request_id,
            "status": "Rejected",
            "reviewed_by": admin["user_id"],
            "reason": rejection.reason.strip()
        }

    except OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is currently unavailable"
        )
