
from fastapi import APIRouter, HTTPException, Depends
from psycopg import OperationalError, IntegrityError
from psycopg.rows import dict_row
from auth import require_booking_access
from db import get_connection
from schemas import SessionCreate
from services.scheduler import find_antenna_conflicts

router = APIRouter(
    prefix="/scheduling",
    tags=["Scheduling"]
)


@router.get("/status")
def scheduling_status():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")

        return {
            "message": "Scheduling API ready",
            "database_connected": True
        }

    except OperationalError:
        return {
            "message": "Scheduling API database unavailable",
            "database_connected": False
        }



@router.post("/sessions", status_code=201)
def create_session(
    session: SessionCreate,
    user: dict = Depends(require_booking_access)
):
    # Database uses TIMESTAMP WITHOUT TIME ZONE.
    if (
        session.scheduled_start.tzinfo is not None
        or session.scheduled_end.tzinfo is not None
    ):
        raise HTTPException(
            status_code=422,
            detail="Use timestamps without timezone offsets"
        )

    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:

                # 1. Validate communication window.
                cur.execute(
                    """
                    SELECT window_id, start_time, end_time,
                           groundstation_id
                    FROM public.communication_window
                    WHERE window_id = %s
                    """,
                    (session.window_id,)
                )

                window = cur.fetchone()

                if window is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Communication window not found"
                    )

                if window["groundstation_id"] != session.station_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Station does not match communication window"
                    )

                if (
                    session.scheduled_start < window["start_time"]
                    or session.scheduled_end > window["end_time"]
                ):
                    raise HTTPException(
                        status_code=400,
                        detail="Session must be within communication window"
                    )

                # 2. Validate antenna.
                cur.execute(
                    """
                    SELECT antenna_id, station_id, status
                    FROM public.antenna
                    WHERE antenna_id = %s
                    """,
                    (session.antenna_id,)
                )

                antenna = cur.fetchone()

                if antenna is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Antenna not found"
                    )

                if antenna["station_id"] != session.station_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Antenna does not belong to station"
                    )

                if antenna["status"] != "Active":
                    raise HTTPException(
                        status_code=409,
                        detail="Antenna is not active"
                    )

                # 3. Find overlapping confirmed bookings.
                cur.execute(
                    """
                    SELECT session_id, antenna_id,
                           scheduled_start, scheduled_end
                    FROM public.communication_session
                    WHERE antenna_id = %s
                      AND scheduled_start < %s
                      AND scheduled_end > %s
                    """,
                    (
                        session.antenna_id,
                        session.scheduled_end,
                        session.scheduled_start
                    )
                )

                existing_sessions = cur.fetchall()

                conflicts = find_antenna_conflicts(
                    antenna_id=session.antenna_id,
                    start_time=session.scheduled_start,
                    end_time=session.scheduled_end,
                    existing_sessions=existing_sessions
                )

                if conflicts:
                    raise HTTPException(
                        status_code=409,
                        detail="Antenna is already booked during this time"
                    )

                # 4. Check maintenance conflicts.
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
                        session.antenna_id,
                        session.scheduled_end,
                        session.scheduled_start
                    )
                )

                if cur.fetchone() is not None:
                    raise HTTPException(
                        status_code=409,
                        detail="Antenna is under scheduled maintenance"
                    )

                # 5. Validate frequency band.
                cur.execute(
                    """
                    SELECT frequency_id, availability_status
                    FROM public.frequency_band
                    WHERE frequency_id = %s
                    """,
                    (session.frequency,)
                )

                frequency = cur.fetchone()

                if frequency is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Frequency band not found"
                    )

                if frequency["availability_status"] != "Available":
                    raise HTTPException(
                        status_code=409,
                        detail="Frequency band is not available"
                    )

                # 6. Save request for approval.
                # No confirmed session is created here.
                cur.execute(
                    """
                    INSERT INTO public.booking_request (
                        window_id,
                        antenna_id,
                        station_id,
                        frequency,
                        scheduled_start,
                        scheduled_end,
                        status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, 'Pending')
                    RETURNING request_id, status
                    """,
                    (
                        session.window_id,
                        session.antenna_id,
                        session.station_id,
                        session.frequency,
                        session.scheduled_start,
                        session.scheduled_end
                    )
                )

                booking_request = cur.fetchone()

        # Connection context commits on successful exit.
        return {
            "message": "Booking request submitted for approval",
            "request_id": booking_request["request_id"],
            "status": booking_request["status"],
            "booking_created": False,
            "database_connected": True
        }

    except OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is currently unavailable"
        )

    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Booking request violates a database constraint"
        )
