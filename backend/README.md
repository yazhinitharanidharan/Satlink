# SATLINK Backend

FastAPI backend for the SATLINK Satellite Communication & Ground Station Management Platform.

## Features

- JWT-based authentication
- Satellite information API
- Communication session scheduling
- Scheduling conflict detection
- Admin approval and rejection of booking requests
- Automated backend tests

## Requirements

- Python 3.11+
- PostgreSQL
- The base schema and UI integration migration applied to a SATLINK database

## Local setup

Run these commands from the backend directory.

### 1. Create a virtual environment

python -m venv .venv

### 2. Activate it (Windows PowerShell)

.\.venv\Scripts\Activate.ps1

### 3. Install dependencies

python -m pip install -r requirements.txt

### 4. Configure environment variables

Copy .env.example to .env and replace the placeholder values with your own PostgreSQL credentials and a securely generated JWT secret.

Do not commit .env to GitHub.

### 5. Prepare the database

Create a new, empty PostgreSQL database named `satlink_db`.

Import the included database schema from the backend directory:

    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d satlink_db -v ON_ERROR_STOP=1 -f satlink_schema.sql

Then apply the UI integration migration:

    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d satlink_db -v ON_ERROR_STOP=1 -f satlink_ui_integration.sql

Enter your PostgreSQL password when prompted.

The migration adds the nullable columns used by the frontend and is safe to run more than once. The schema does not include initial users or reference data.

**Important:** Import the base schema only into a new, empty database. Do not run it against your existing working database.

### 6. Create the first administrator

python create_admin.py --username admin --email admin@satlink.local

You will be prompted for a password of at least 8 characters.

### 7. Start the API

python -m uvicorn main:app --reload

API documentation: http://127.0.0.1:8000/docs

Health endpoint: http://127.0.0.1:8000/health

## Run tests

python -m pytest -q

## Team notes

The frontend and backend are maintained in the same SATLINK repository.

The backend requires a running PostgreSQL database and valid environment configuration for database-backed endpoints.
