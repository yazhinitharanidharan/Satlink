# SATLINK Frontend

AI-driven satellite operations and ground station scheduling platform - Frontend Application

## Overview

SATLINK is a comprehensive web application for managing satellite missions, ground stations, communication scheduling, telemetry monitoring, and operational oversight. This is a React-based frontend designed to integrate with a FastAPI backend and PostgreSQL database.

## Technology Stack

- **Framework**: React 19 with Vite
- **Routing**: React Router DOM v7
- **Styling**: CSS with CSS Variables
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Native Fetch API

## Prerequisites

- Node.js 18+ and npm
- FastAPI backend running on http://localhost:8000 (optional - app works in demo mode)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd satlink-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create environment file:
   ```bash
   cp .env.example .env
   ```
5. Update `.env` with your backend URL if different

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Features

### Core Functionality
- **Dashboard**: Mission control overview with KPIs, charts, and recent activity
- **Missions**: Manage satellite missions with CRUD operations
- **Satellites**: Spacecraft inventory and status tracking
- **Ground Stations & Antennas**: Infrastructure management
- **Communication Scheduling**: Schedule and manage satellite communication sessions with conflict detection
- **Telemetry**: Monitor spacecraft health and performance
- **Alerts**: System notifications and warnings
- **Reports**: Analytical reports with CSV export

### Key Features
- **Dark Theme**: Aerospace mission control interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Demo Mode**: Fully functional with realistic sample data
- **API Integration Ready**: Centralized service layer for backend integration
- **Real-time Conflict Detection**: Scheduling conflict warnings
- **Data Visualization**: Interactive charts with Recharts

## Project Structure

```
src/
├── components/     # Reusable UI components
├── layouts/        # App shell (Sidebar, Header, Layout)
├── pages/          # Page components
├── services/       # API service layer
├── data/           # Mock data for demo mode
├── styles/         # Global styles and CSS variables
└── utils/          # Utility functions
```

## Mock Data Mode

The application runs in demo mode by default with internally consistent sample data. All CRUD operations work within the session. To connect to a real backend:

1. Set `USE_MOCK = false` in service files
2. Configure `VITE_API_BASE_URL` in `.env`
3. Ensure backend API endpoints match the expected contract

## API Integration

The app expects a FastAPI backend with RESTful endpoints. Key endpoints include:
- `/missions`, `/satellites`, `/ground-stations`
- `/sessions`, `/recommendations`
- `/telemetry`, `/alerts`
- `/reports/*`

See service files in `src/services/` for detailed API contracts.

## Known Limitations

- Demo mode data is not persisted
- Some pages are placeholder components (to be expanded)
- Authentication not implemented
- Real orbital calculations not included
- No direct database connection from frontend

## CSV Export

Reports page supports CSV export for mission, station, session, and engineer reports.

## License

This project is for academic purposes as part of DBMS coursework.
