
from fastapi import APIRouter, HTTPException
from db import get_connection
from psycopg.rows import dict_row
from psycopg import OperationalError

router = APIRouter(prefix="/satellites", tags=["Satellites"])


@router.get("/")
def list_satellites():
    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("""
                    SELECT
                        satellite_id,
                        satellite_name,
                        orbit_type,
                        launch_date,
                        health_status,
                        mission_id
                    FROM public.satellite
                    ORDER BY satellite_id
                """)
                return {"satellites": cur.fetchall()}

    except OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is currently unavailable"
        )
