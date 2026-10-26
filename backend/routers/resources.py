import re
from typing import Any, Callable

from fastapi import APIRouter, Body, Depends, HTTPException
from psycopg import DataError, IntegrityError, OperationalError
from psycopg.rows import dict_row

from auth import get_current_user, hash_password
from db import get_connection

router = APIRouter(prefix="/data", tags=["Application Data"])


SNAPSHOT_QUERIES = {
    "missions": """
        SELECT
            mission_id,
            mission_name,
            description,
            lower(COALESCE(status, 'planning')) AS status,
            COALESCE(start_date, launch_date) AS start_date,
            end_date,
            COALESCE(lead_engineer, agency) AS lead_engineer
        FROM public.mission
        ORDER BY mission_id
    """,
    "satellites": """
        SELECT
            satellite_id AS sat_id,
            satellite_name AS sat_name,
            mission_id,
            CASE lower(COALESCE(health_status, 'operational'))
                WHEN 'active' THEN 'operational'
                WHEN 'inactive' THEN 'standby'
                WHEN 'operational' THEN 'operational'
                WHEN 'standby' THEN 'standby'
                WHEN 'maintenance' THEN 'maintenance'
                WHEN 'decommissioned' THEN 'decommissioned'
                ELSE lower(health_status)
            END AS status,
            orbit_type,
            norad_id,
            launch_date
        FROM public.satellite
        ORDER BY satellite_id
    """,
    "payloads": """
        SELECT
            payload_id,
            satellite_id AS sat_id,
            payload_name,
            payload_type,
            lower(COALESCE(status, 'active')) AS status,
            mass_kg
        FROM public.satellite_payload
        ORDER BY payload_id
    """,
    "groundStations": """
        SELECT
            station_id AS gs_id,
            station_name AS gs_name,
            location,
            latitude,
            longitude,
            lower(COALESCE(status, 'operational')) AS status,
            elevation_m
        FROM public.ground_station
        ORDER BY station_id
    """,
    "antennas": """
        SELECT
            antenna_id AS ant_id,
            station_id AS gs_id,
            antenna_name AS ant_name,
            CASE lower(COALESCE(
                availability_status,
                CASE lower(COALESCE(status, 'Active'))
                    WHEN 'active' THEN 'available'
                    WHEN 'maintenance' THEN 'maintenance'
                    WHEN 'in_use' THEN 'in_use'
                    ELSE 'available'
                END
            ))
                WHEN 'available' THEN 'available'
                WHEN 'in_use' THEN 'in_use'
                WHEN 'in use' THEN 'in_use'
                WHEN 'maintenance' THEN 'maintenance'
                ELSE lower(COALESCE(availability_status, status, 'available'))
            END AS status,
            frequency_range,
            diameter_m
        FROM public.antenna
        ORDER BY antenna_id
    """,
    "frequencyBands": """
        SELECT
            frequency_id AS band_id,
            band_name,
            COALESCE(
                frequency_range,
                NULLIF(concat_ws(' - ', start_frequency, end_frequency), '')
            ) AS frequency_range,
            description,
            CASE lower(COALESCE(availability_status, 'Available'))
                WHEN 'available' THEN 'available'
                WHEN 'restricted' THEN 'restricted'
                WHEN 'retired' THEN 'retired'
                ELSE lower(availability_status)
            END AS status
        FROM public.frequency_band
        ORDER BY frequency_id
    """,
    "communicationWindows": """
        SELECT
            window_id,
            satellite_id AS sat_id,
            groundstation_id AS gs_id,
            start_time,
            end_time,
            lower(COALESCE(status, 'predicted')) AS status,
            azimuth,
            elevation
        FROM public.communication_window
        ORDER BY start_time, window_id
    """,
    "communicationSessions": """
        SELECT
            cs.session_id,
            cs.window_id,
            cw.satellite_id AS sat_id,
            cs.station_id AS gs_id,
            cs.antenna_id AS ant_id,
            cs.frequency AS band_id,
            cs.scheduled_start AS start_time,
            cs.scheduled_end AS end_time,
            lower(COALESCE(cs.status, 'scheduled')) AS status,
            cs.operator
        FROM public.communication_session cs
        LEFT JOIN public.communication_window cw
            ON cw.window_id = cs.window_id
        ORDER BY cs.scheduled_start, cs.session_id
    """,
    "schedulingRecommendations": """
        SELECT
            sr.recommendation_id AS rec_id,
            sr.satellite_id AS sat_id,
            cw.groundstation_id AS gs_id,
            sr.window_id,
            cw.start_time AS proposed_start,
            cw.end_time AS proposed_end,
            NULL::integer AS band_id,
            NULL::text AS rationale,
            CASE lower(COALESCE(sr.recommendation_status, 'pending'))
                WHEN 'pending' THEN 'pending'
                WHEN 'accepted' THEN 'accepted'
                WHEN 'rejected' THEN 'rejected'
                ELSE lower(sr.recommendation_status)
            END AS status,
            sr.confidence_score
        FROM public.scheduling_recommendation sr
        LEFT JOIN public.communication_window cw
            ON cw.window_id = sr.window_id
        ORDER BY sr.recommendation_id
    """,
    "engineers": """
        SELECT
            engineer_id AS eng_id,
            engineer_name AS eng_name,
            role,
            email,
            specialization,
            CASE lower(COALESCE(availability_status, 'Available'))
                WHEN 'available' THEN 'active'
                WHEN 'active' THEN 'active'
                WHEN 'on_call' THEN 'on_call'
                WHEN 'inactive' THEN 'inactive'
                ELSE lower(availability_status)
            END AS status
        FROM public.engineer
        ORDER BY engineer_id
    """,
    "engineerAssignments": """
        SELECT
            ea.assignment_id AS assign_id,
            ea.engineer_id AS eng_id,
            ea.session_id,
            ea.role,
            COALESCE(cs.scheduled_start, CURRENT_TIMESTAMP) AS assigned_at
        FROM public.engineer_assignment ea
        LEFT JOIN public.communication_session cs
            ON cs.session_id = ea.session_id
        ORDER BY ea.assignment_id
    """,
    "maintenanceLogs": """
        SELECT
            ml.maintenance_id AS maint_id,
            ml.antenna_id AS ant_id,
            a.station_id AS gs_id,
            ml.maintenance_type AS maint_type,
            ml.remarks AS description,
            COALESCE(ml.scheduled_start, ml.maintenance_date) AS start_date,
            ml.scheduled_end AS end_date,
            CASE lower(replace(COALESCE(ml.status, 'Scheduled'), ' ', '_'))
                WHEN 'scheduled' THEN 'scheduled'
                WHEN 'in_progress' THEN 'in_progress'
                WHEN 'completed' THEN 'completed'
                WHEN 'cancelled' THEN 'cancelled'
                ELSE lower(ml.status)
            END AS status,
            ml.engineer_id AS eng_id
        FROM public.maintenance_log ml
        LEFT JOIN public.antenna a
            ON a.antenna_id = ml.antenna_id
        ORDER BY ml.maintenance_date, ml.maintenance_id
    """,
    "weatherRecords": """
        SELECT
            weather_id,
            station_id AS gs_id,
            record_time AS observation_time,
            temperature AS temperature_c,
            humidity_percent,
            wind_speed AS wind_speed_kmh,
            precipitation_mm,
            cloud_cover_percent,
            condition AS conditions
        FROM public.weather_record
        ORDER BY record_time DESC, weather_id DESC
    """,
    "commandLogs": """
        SELECT
            cl.command_id AS cmd_id,
            cl.session_id,
            cw.satellite_id AS sat_id,
            cl.command_type,
            cl.start_time AS timestamp,
            lower(COALESCE(cl.status, 'Pending')) AS status,
            cl.sent_by,
            cl.command_description AS details
        FROM public.command_log cl
        LEFT JOIN public.communication_session cs
            ON cs.session_id = cl.session_id
        LEFT JOIN public.communication_window cw
            ON cw.window_id = cs.window_id
        ORDER BY cl.start_time DESC, cl.command_id DESC
    """,
    "telemetryLogs": """
        SELECT
            tl.telemetry_id AS tel_id,
            cw.satellite_id AS sat_id,
            tl.session_id,
            tl.record_time AS timestamp,
            tl.parameter_name AS measurement_type,
            tl.parameter_value AS value,
            tl.unit
        FROM public.telemetry_log tl
        LEFT JOIN public.communication_session cs
            ON cs.session_id = tl.session_id
        LEFT JOIN public.communication_window cw
            ON cw.window_id = cs.window_id
        ORDER BY tl.record_time DESC, tl.telemetry_id DESC
    """,
    "alerts": """
        SELECT
            alert_id,
            lower(severity) AS severity,
            alert_type AS category,
            alert_message AS description,
            alert_time AS timestamp,
            CASE lower(COALESCE(status, 'Open'))
                WHEN 'open' THEN 'unread'
                WHEN 'unread' THEN 'unread'
                WHEN 'acknowledged' THEN 'acknowledged'
                WHEN 'resolved' THEN 'resolved'
                ELSE lower(status)
            END AS status,
            NULL::text AS related_entity,
            NULL::integer AS entity_id
        FROM public.alert
        ORDER BY alert_time DESC, alert_id DESC
    """,
    "users": """
        SELECT
            user_id,
            user_name AS username,
            COALESCE(full_name, user_name) AS full_name,
            email,
            CASE role WHEN 'Admin' THEN 'Administrator' ELSE role END AS role,
            lower(COALESCE(status, 'active')) AS status
        FROM public.app_user
        ORDER BY user_id
    """,
}


def _availability_status(value: Any) -> str:
    if value is None or value == "":
        return "Available"

    mapping = {
        "available": "Available",
        "restricted": "Restricted",
        "retired": "Retired",
    }
    return mapping.get(str(value).lower(), str(value))


def _antenna_availability(value: Any) -> str:
    if value is None or value == "":
        return "available"

    mapping = {
        "available": "available",
        "in_use": "in_use",
        "in use": "in_use",
        "maintenance": "maintenance",
    }
    return mapping.get(str(value).lower(), str(value))


def _antenna_db_status(value: Any) -> str:
    return "Maintenance" if str(value).lower() == "maintenance" else "Active"


def _mapped_value(value: Any, mapping: dict[str, str]) -> Any:
    if value is None or value == "":
        return value
    return mapping.get(str(value).lower(), str(value))


def _maintenance_status(value: Any) -> Any:
    return _mapped_value(
        value,
        {
            "scheduled": "Scheduled",
            "in_progress": "In Progress",
            "completed": "Completed",
            "cancelled": "Cancelled",
        },
    )


def _command_status(value: Any) -> Any:
    return _mapped_value(
        value,
        {
            "pending": "Pending",
            "executed": "Executed",
            "failed": "Failed",
        },
    )


def _recommendation_status(value: Any) -> Any:
    return _mapped_value(
        value,
        {
            "pending": "Pending",
            "accepted": "Accepted",
            "rejected": "Rejected",
        },
    )


def _alert_status(value: Any) -> Any:
    return _mapped_value(
        value,
        {
            "unread": "Open",
            "open": "Open",
            "acknowledged": "Acknowledged",
            "resolved": "Resolved",
        },
    )


def _user_role(value: Any) -> Any:
    return _mapped_value(
        value,
        {
            "administrator": "Admin",
            "admin": "Admin",
            "operator": "Operator",
            "engineer": "Engineer",
            "viewer": "Viewer",
        },
    )


def _date_only(value: Any) -> Any:
    if value is None or value == "":
        return None
    if isinstance(value, str):
        return value[:10]
    return value


def _range_start(value: Any) -> Any:
    numbers = re.findall(r"-?\d+(?:\.\d+)?", str(value or ""))
    return numbers[0] if numbers else None


def _range_end(value: Any) -> Any:
    numbers = re.findall(r"-?\d+(?:\.\d+)?", str(value or ""))
    return numbers[1] if len(numbers) > 1 else None


def _hash_password(value: Any) -> Any:
    return hash_password(value) if value else None


# Each entry is: (UI field, database column, optional transform).
WRITE_ENTRIES = {
    "missions": [
        ("mission_name", "mission_name", None),
        ("description", "description", None),
        ("status", "status", None),
        ("lead_engineer", "lead_engineer", None),
        ("start_date", "start_date", None),
        ("end_date", "end_date", None),
        ("start_date", "launch_date", None),
        ("lead_engineer", "agency", None),
    ],
    "satellites": [
        ("sat_name", "satellite_name", None),
        ("mission_id", "mission_id", None),
        ("status", "health_status", None),
        ("orbit_type", "orbit_type", None),
        ("norad_id", "norad_id", None),
        ("launch_date", "launch_date", None),
    ],
    "payloads": [
        ("payload_name", "payload_name", None),
        ("sat_id", "satellite_id", None),
        ("payload_type", "payload_type", None),
        ("status", "status", None),
        ("mass_kg", "mass_kg", None),
    ],
    "groundStations": [
        ("gs_name", "station_name", None),
        ("location", "location", None),
        ("latitude", "latitude", None),
        ("longitude", "longitude", None),
        ("status", "status", None),
        ("elevation_m", "elevation_m", None),
    ],
    "antennas": [
        ("ant_name", "antenna_name", None),
        ("gs_id", "station_id", None),
        ("status", "availability_status", _antenna_availability),
        ("status", "status", _antenna_db_status),
        ("frequency_range", "frequency_range", None),
        ("diameter_m", "diameter_m", None),
    ],
    "frequencyBands": [
        ("band_name", "band_name", None),
        ("frequency_range", "frequency_range", None),
        ("frequency_range", "start_frequency", _range_start),
        ("frequency_range", "end_frequency", _range_end),
        ("description", "description", None),
        ("status", "availability_status", _availability_status),
    ],
    "communicationWindows": [
        ("sat_id", "satellite_id", None),
        ("gs_id", "groundstation_id", None),
        ("start_time", "start_time", None),
        ("end_time", "end_time", None),
        ("status", "status", None),
        ("azimuth", "azimuth", None),
        ("elevation", "elevation", None),
    ],
    "communicationSessions": [
        ("window_id", "window_id", None),
        ("gs_id", "station_id", None),
        ("ant_id", "antenna_id", None),
        ("band_id", "frequency", None),
        ("start_time", "scheduled_start", None),
        ("end_time", "scheduled_end", None),
        ("status", "status", None),
        ("operator", "operator", None),
    ],
    "schedulingRecommendations": [
        ("status", "recommendation_status", _recommendation_status),
    ],
    "engineers": [
        ("eng_name", "engineer_name", None),
        ("role", "role", None),
        ("email", "email", None),
        ("specialization", "specialization", None),
        ("status", "availability_status", None),
    ],
    "engineerAssignments": [
        ("eng_id", "engineer_id", None),
        ("session_id", "session_id", None),
        ("role", "role", None),
    ],
    "maintenanceLogs": [
        ("ant_id", "antenna_id", None),
        ("maint_type", "maintenance_type", None),
        ("eng_id", "engineer_id", None),
        ("description", "remarks", None),
        ("start_date", "maintenance_date", _date_only),
        ("start_date", "scheduled_start", None),
        ("end_date", "scheduled_end", None),
        ("status", "status", _maintenance_status),
    ],
    "weatherRecords": [
        ("gs_id", "station_id", None),
        ("observation_time", "record_time", None),
        ("temperature_c", "temperature", None),
        ("humidity_percent", "humidity_percent", None),
        ("wind_speed_kmh", "wind_speed", None),
        ("precipitation_mm", "precipitation_mm", None),
        ("cloud_cover_percent", "cloud_cover_percent", None),
        ("conditions", "condition", None),
    ],
    "commandLogs": [
        ("session_id", "session_id", None),
        ("command_type", "command_type", None),
        ("sent_by", "sent_by", None),
        ("timestamp", "start_time", None),
        ("status", "status", _command_status),
        ("details", "command_description", None),
    ],
    "telemetryLogs": [
        ("session_id", "session_id", None),
        ("measurement_type", "parameter_name", None),
        ("value", "parameter_value", None),
        ("unit", "unit", None),
        ("timestamp", "record_time", None),
    ],
    "alerts": [
        ("severity", "severity", None),
        ("category", "alert_type", None),
        ("description", "alert_message", None),
        ("timestamp", "alert_time", None),
        ("status", "status", _alert_status),
    ],
    "users": [
        ("username", "user_name", None),
        ("full_name", "full_name", None),
        ("email", "email", None),
        ("role", "role", _user_role),
        ("status", "status", None),
        ("password", "password", _hash_password),
    ],
}

ID_COLUMNS = {
    "missions": "mission_id",
    "satellites": "satellite_id",
    "payloads": "payload_id",
    "groundStations": "station_id",
    "antennas": "antenna_id",
    "frequencyBands": "frequency_id",
    "communicationWindows": "window_id",
    "communicationSessions": "session_id",
    "schedulingRecommendations": "recommendation_id",
    "engineers": "engineer_id",
    "engineerAssignments": "assignment_id",
    "maintenanceLogs": "maintenance_id",
    "weatherRecords": "weather_id",
    "commandLogs": "command_id",
    "telemetryLogs": "telemetry_id",
    "alerts": "alert_id",
    "users": "user_id",
}

TABLES = {
    "missions": "mission",
    "satellites": "satellite",
    "payloads": "satellite_payload",
    "groundStations": "ground_station",
    "antennas": "antenna",
    "frequencyBands": "frequency_band",
    "communicationWindows": "communication_window",
    "communicationSessions": "communication_session",
    "schedulingRecommendations": "scheduling_recommendation",
    "engineers": "engineer",
    "engineerAssignments": "engineer_assignment",
    "maintenanceLogs": "maintenance_log",
    "weatherRecords": "weather_record",
    "commandLogs": "command_log",
    "telemetryLogs": "telemetry_log",
    "alerts": "alert",
    "users": "app_user",
}

Transform = Callable[[Any], Any]


def _normalize(value: Any) -> Any:
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


def _authorize(collection: str, user: dict) -> None:
    if collection == "users" and user["role"] != "Admin":
        raise HTTPException(403, "Admin access required")

    if collection == "communicationSessions" and user["role"] not in (
        "Admin",
        "Operator",
    ):
        raise HTTPException(403, "Admin or Operator access required")


def _validate_session(cur, data: dict, partial: bool = False) -> None:
    required = [
        "window_id",
        "gs_id",
        "ant_id",
        "band_id",
        "start_time",
        "end_time",
    ]

    if not partial:
        missing = [field for field in required if not data.get(field)]
        if missing:
            raise HTTPException(
                422,
                f"Missing required session fields: {', '.join(missing)}",
            )

    if data.get("window_id"):
        cur.execute(
            """
            SELECT groundstation_id, satellite_id, start_time, end_time
            FROM public.communication_window
            WHERE window_id = %s
            """,
            (data["window_id"],),
        )
        window = cur.fetchone()

        if window is None:
            raise HTTPException(404, "Communication window not found")

        if data.get("gs_id") and window["groundstation_id"] != int(data["gs_id"]):
            raise HTTPException(400, "Station does not match communication window")

        if data.get("sat_id") and window["satellite_id"] != int(data["sat_id"]):
            raise HTTPException(400, "Satellite does not match communication window")

    if data.get("ant_id") and data.get("gs_id"):
        cur.execute(
            "SELECT station_id FROM public.antenna WHERE antenna_id = %s",
            (data["ant_id"],),
        )
        antenna = cur.fetchone()

        if antenna is None:
            raise HTTPException(404, "Antenna not found")

        if antenna["station_id"] != int(data["gs_id"]):
            raise HTTPException(400, "Antenna does not belong to station")


def _insert_record(cur, collection: str, payload: dict) -> None:
    entries = WRITE_ENTRIES[collection]
    columns = []
    values = []

    for ui_field, db_column, transform in entries:
        value = payload.get(ui_field)
        if transform:
            value = transform(value)
        columns.append(db_column)
        values.append(_normalize(value))

    placeholders = ", ".join(["%s"] * len(columns))
    cur.execute(
        f"""
        INSERT INTO public.{TABLES[collection]} ({", ".join(columns)})
        VALUES ({placeholders})
        """,
        values,
    )


def _update_record(
    cur,
    collection: str,
    record_id: int,
    payload: dict,
) -> None:
    entries = WRITE_ENTRIES[collection]
    assignments = []
    values = []

    for ui_field, db_column, transform in entries:
        if ui_field not in payload:
            continue

        if ui_field == "password" and not payload.get("password"):
            continue

        value = payload.get(ui_field)
        if transform:
            value = transform(value)

        assignments.append(f"{db_column} = %s")
        values.append(_normalize(value))

    if not assignments:
        raise HTTPException(400, "No editable fields were supplied")

    values.append(record_id)
    cur.execute(
        f"""
        UPDATE public.{TABLES[collection]}
        SET {", ".join(assignments)}
        WHERE {ID_COLUMNS[collection]} = %s
        """,
        values,
    )

    if cur.rowcount == 0:
        raise HTTPException(404, "Record not found")


def _parse_record_id(record_id: str) -> int:
    try:
        return int(record_id)
    except (TypeError, ValueError):
        raise HTTPException(422, "Record id must be an integer")


@router.get("")
def get_application_data(user: dict = Depends(get_current_user)):
    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                snapshot = {}
                for collection, query in SNAPSHOT_QUERIES.items():
                    cur.execute(query)
                    snapshot[collection] = cur.fetchall()

        return snapshot

    except OperationalError:
        raise HTTPException(503, "Database is currently unavailable")


@router.post("/{collection}", status_code=201)
def create_record(
    collection: str,
    payload: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    if collection not in WRITE_ENTRIES:
        raise HTTPException(404, "Unknown data collection")

    _authorize(collection, user)

    if collection == "schedulingRecommendations":
        raise HTTPException(
            405,
            "Scheduling recommendations can only be updated",
        )

    if collection == "users":
        password = payload.get("password")
        if not password:
            raise HTTPException(422, "Password is required for a new user")
        if len(str(password)) < 8:
            raise HTTPException(422, "Password must be at least 8 characters")

    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                if collection == "communicationSessions":
                    _validate_session(cur, payload)
                if collection == "users":
                    payload = {**payload, "password": payload["password"]}
                _insert_record(cur, collection, payload)

        return {
            "message": "Record created",
            "collection": collection,
        }

    except HTTPException:
        raise

    except OperationalError:
        raise HTTPException(503, "Database is currently unavailable")

    except IntegrityError as error:
        raise HTTPException(
            409,
            f"Record violates a database constraint: {error.diag.message_primary}",
        )

    except DataError as error:
        raise HTTPException(
            400,
            f"Invalid value supplied: {error.diag.message_primary}",
        )


@router.put("/{collection}/{record_id}")
def update_record(
    collection: str,
    record_id: str,
    payload: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    if collection not in WRITE_ENTRIES:
        raise HTTPException(404, "Unknown data collection")

    _authorize(collection, user)
    parsed_id = _parse_record_id(record_id)

    if collection == "users" and payload.get("password"):
        if len(str(payload["password"])) < 8:
            raise HTTPException(422, "Password must be at least 8 characters")

    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                if collection == "communicationSessions":
                    _validate_session(cur, payload, partial=True)
                _update_record(cur, collection, parsed_id, payload)

        return {
            "message": "Record updated",
            "collection": collection,
            "record_id": parsed_id,
        }

    except HTTPException:
        raise

    except OperationalError:
        raise HTTPException(503, "Database is currently unavailable")

    except IntegrityError as error:
        raise HTTPException(
            409,
            f"Record violates a database constraint: {error.diag.message_primary}",
        )

    except DataError as error:
        raise HTTPException(
            400,
            f"Invalid value supplied: {error.diag.message_primary}",
        )


@router.delete("/{collection}/{record_id}")
def delete_record(
    collection: str,
    record_id: str,
    user: dict = Depends(get_current_user),
):
    if collection not in WRITE_ENTRIES:
        raise HTTPException(404, "Unknown data collection")

    _authorize(collection, user)
    parsed_id = _parse_record_id(record_id)

    if collection == "users" and parsed_id == user["user_id"]:
        raise HTTPException(400, "You cannot delete your own account")

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    DELETE FROM public.{TABLES[collection]}
                    WHERE {ID_COLUMNS[collection]} = %s
                    """,
                    (parsed_id,),
                )

                if cur.rowcount == 0:
                    raise HTTPException(404, "Record not found")

        return {
            "message": "Record deleted",
            "collection": collection,
            "record_id": parsed_id,
        }

    except HTTPException:
        raise

    except OperationalError:
        raise HTTPException(503, "Database is currently unavailable")

    except IntegrityError:
        raise HTTPException(
            409,
            "Record is still referenced by other data and cannot be deleted",
        )
