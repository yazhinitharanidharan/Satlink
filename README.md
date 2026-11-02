# SATLINK

Satellite operations and ground station scheduling platform built with React, FastAPI and PostgreSQL.

## Stack

- Frontend: React 19 + Vite, React Router, Recharts, Lucide
- Backend: FastAPI, psycopg 3, PyJWT, pwdlib (Argon2)
- Database: PostgreSQL

## Prerequisites

- Node.js 20.19+ (or 22.12+) and npm
- Python 3.11+
- PostgreSQL running locally

## Database Setup

Create the database and load the schema from `backend/`:

```bash
createdb -U postgres satlink_db
psql -U postgres -h localhost -d satlink_db -v ON_ERROR_STOP=1 -f satlink_schema.sql
psql -U postgres -h localhost -d satlink_db -v ON_ERROR_STOP=1 -f satlink_ui_integration.sql
```

`satlink_ui_integration.sql` is a non-destructive, idempotent migration that adds the columns used by the UI. Apply it after the base schema.

## Backend Setup

From `backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set `DB_PASSWORD` and a long random `JWT_SECRET_KEY`. Then create the first administrator:

```bash
python create_admin.py --username admin --email admin@satlink.local
```

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Frontend Setup

From the repository root:

```bash
npm install
copy .env.example .env
npm run dev
```

The application opens at http://localhost:5173. `VITE_API_BASE_URL` defaults to `http://localhost:8000`.

## Authentication

Login uses `POST /auth/login` with an OAuth2 form body and stores a JWT in local storage. The app calls `GET /auth/me` on startup to restore the session. Any `401` response clears the session and returns to the login screen.

The first account must be created with `backend/create_admin.py`. Additional accounts can be managed from the Users page by an administrator.

## API Overview

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/login` | Obtain an access token |
| `GET /auth/me` | Current user profile |
| `GET /data` | Normalized snapshot of all UI collections |
| `POST /data/{collection}` | Create a record |
| `PUT /data/{collection}/{id}` | Update a record |
| `DELETE /data/{collection}/{id}` | Delete a record |
| `POST /scheduling/sessions` | Booking request with conflict checks |
| `POST /approvals/{id}/approve` | Approve a booking (Admin) |
| `POST /approvals/{id}/reject` | Reject a booking (Admin) |

The `/data` layer maps database column names to the field names already used by the frontend. Users writes require the Admin role; session writes require Admin or Operator.

## Features

- Mission, satellite, payload, station, antenna and frequency band management
- Communication windows, sessions and scheduling recommendations
- Maintenance, weather, engineers and telemetry records
- Alerts, reports with CSV export, global search and notifications
- JWT authentication with role-based write restrictions for users and sessions
- Conflict warnings for antenna overlaps and planned maintenance

## Verification

```bash
# Frontend
npm run lint
npm run build

# Backend (from backend/)
pytest
```

## Limitations

- No real orbital propagation or link-budget calculations
- Command logs are records only; no commands are transmitted to spacecraft
- Weather records are stored observations, not a live feed
- Scheduling recommendations are stored suggestions, not a production AI service

## Video Demonstration

Youtube Link: https://youtu.be/uOUwR5WGLBE?si=6dhGJoWbQbFNIwS4