
from db import get_connection


def check_antenna_conflict(
    antenna_id: int,
    start_time,
    end_time
) -> bool:
    """
    Return True if the antenna has an overlapping session.
    Requires the PostgreSQL database to be ready.
    """

    query = """
        SELECT EXISTS (
            SELECT 1
            FROM communication_session
            WHERE antenna_id = %s
              AND scheduled_start < %s
              AND scheduled_end > %s
        )
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                query,
                (antenna_id, end_time, start_time)
            )
            return cur.fetchone()[0]

def check_session_within_window(
    window_id: int,
    start_time,
    end_time
) -> bool:
    """
    Return True if the requested session fits
    inside its communication window.

    Requires PostgreSQL and the final schema.
    """

    query = """
        SELECT EXISTS (
            SELECT 1
            FROM communication_window
            WHERE window_id = %s
              AND start_time <= %s
              AND end_time >= %s
        )
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                query,
                (window_id, start_time, end_time)
            )
            return cur.fetchone()[0]
