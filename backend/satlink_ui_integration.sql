--
-- SATLINK UI integration migration.
--
-- Adds the nullable columns required to store the fields exposed by the
-- existing frontend. This migration is non-destructive and safe to run more
-- than once. It does not drop or rename any existing column or table.
--
-- Apply after satlink_schema.sql:
--   psql -U postgres -h localhost -d satlink_db -v ON_ERROR_STOP=1 \
--        -f satlink_ui_integration.sql
--

BEGIN;

-- Missions: status, ownership and scheduling window used by the UI.
ALTER TABLE public.mission
    ADD COLUMN IF NOT EXISTS status character varying(30) DEFAULT 'planning',
    ADD COLUMN IF NOT EXISTS lead_engineer character varying(150),
    ADD COLUMN IF NOT EXISTS start_date date,
    ADD COLUMN IF NOT EXISTS end_date date;

-- Satellites: NORAD catalogue identifier.
ALTER TABLE public.satellite
    ADD COLUMN IF NOT EXISTS norad_id character varying(50);

-- Payloads: mass is displayed and edited by the UI.
ALTER TABLE public.satellite_payload
    ADD COLUMN IF NOT EXISTS mass_kg numeric(12,3);

-- Ground stations: station elevation is displayed by the UI.
ALTER TABLE public.ground_station
    ADD COLUMN IF NOT EXISTS elevation_m numeric(10,2);

-- Antennas: UI availability is kept separate from the operational status
-- used by the scheduling API.
ALTER TABLE public.antenna
    ADD COLUMN IF NOT EXISTS frequency_range character varying(100),
    ADD COLUMN IF NOT EXISTS diameter_m numeric(10,2),
    ADD COLUMN IF NOT EXISTS availability_status character varying(30);

-- Frequency bands: human-readable range and description.
ALTER TABLE public.frequency_band
    ADD COLUMN IF NOT EXISTS frequency_range character varying(100),
    ADD COLUMN IF NOT EXISTS description text;

-- Communication windows: UI status and look angles.
ALTER TABLE public.communication_window
    ADD COLUMN IF NOT EXISTS status character varying(30) DEFAULT 'predicted',
    ADD COLUMN IF NOT EXISTS azimuth numeric(6,2),
    ADD COLUMN IF NOT EXISTS elevation numeric(6,2);

-- Communication sessions: UI status and operator.
ALTER TABLE public.communication_session
    ADD COLUMN IF NOT EXISTS status character varying(30) DEFAULT 'scheduled',
    ADD COLUMN IF NOT EXISTS operator character varying(150);

-- Engineers: directory role.
ALTER TABLE public.engineer
    ADD COLUMN IF NOT EXISTS role character varying(100);

-- Maintenance: responsible engineer.
ALTER TABLE public.maintenance_log
    ADD COLUMN IF NOT EXISTS engineer_id integer
        REFERENCES public.engineer(engineer_id) ON DELETE SET NULL;

-- Weather: additional observations displayed by the UI.
ALTER TABLE public.weather_record
    ADD COLUMN IF NOT EXISTS humidity_percent numeric(6,2),
    ADD COLUMN IF NOT EXISTS precipitation_mm numeric(10,2),
    ADD COLUMN IF NOT EXISTS cloud_cover_percent numeric(6,2);

-- Command logs: engineer who sent the command.
ALTER TABLE public.command_log
    ADD COLUMN IF NOT EXISTS sent_by integer
        REFERENCES public.engineer(engineer_id) ON DELETE SET NULL;

-- Application users: display name and account status.
ALTER TABLE public.app_user
    ADD COLUMN IF NOT EXISTS full_name character varying(150),
    ADD COLUMN IF NOT EXISTS status character varying(30) DEFAULT 'active';

-- Backfill values so existing rows behave sensibly in the UI.
UPDATE public.app_user
SET full_name = user_name
WHERE full_name IS NULL;

UPDATE public.app_user
SET status = 'active'
WHERE status IS NULL;

UPDATE public.app_user
SET status = lower(status)
WHERE status <> lower(status);

UPDATE public.app_user
SET role = CASE lower(role)
    WHEN 'administrator' THEN 'Admin'
    WHEN 'admin' THEN 'Admin'
    WHEN 'operator' THEN 'Operator'
    WHEN 'engineer' THEN 'Engineer'
    WHEN 'viewer' THEN 'Viewer'
    ELSE role
END;

UPDATE public.engineer
SET role = 'Engineer'
WHERE role IS NULL;

UPDATE public.antenna
SET availability_status = CASE
    WHEN lower(COALESCE(status, 'Active')) = 'active' THEN 'available'
    WHEN lower(COALESCE(status, 'Active')) IN ('in_use', 'in use') THEN 'in_use'
    WHEN lower(COALESCE(status, 'Active')) = 'maintenance' THEN 'maintenance'
    ELSE 'available'
END
WHERE availability_status IS NULL;

-- Keep the operational status used by the scheduling API in canonical form.
UPDATE public.antenna
SET status = CASE lower(COALESCE(status, 'Active'))
    WHEN 'active' THEN 'Active'
    WHEN 'maintenance' THEN 'Maintenance'
    WHEN 'in_use' THEN 'In Use'
    WHEN 'in use' THEN 'In Use'
    ELSE status
END;

UPDATE public.frequency_band
SET availability_status = CASE lower(COALESCE(availability_status, 'Available'))
    WHEN 'available' THEN 'Available'
    WHEN 'restricted' THEN 'Restricted'
    WHEN 'retired' THEN 'Retired'
    ELSE availability_status
END;

UPDATE public.maintenance_log
SET status = CASE lower(replace(COALESCE(status, 'Scheduled'), ' ', '_'))
    WHEN 'scheduled' THEN 'Scheduled'
    WHEN 'in_progress' THEN 'In Progress'
    WHEN 'completed' THEN 'Completed'
    WHEN 'cancelled' THEN 'Cancelled'
    ELSE status
END;

UPDATE public.frequency_band
SET frequency_range = concat_ws(' - ', start_frequency, end_frequency)
WHERE frequency_range IS NULL
  AND start_frequency IS NOT NULL
  AND end_frequency IS NOT NULL;

UPDATE public.communication_window
SET status = 'predicted'
WHERE status IS NULL;

UPDATE public.communication_session
SET status = 'scheduled'
WHERE status IS NULL;

COMMIT;
