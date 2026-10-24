// SATLINK Mock Data - Demonstration Dataset

export const missions = [
  { mission_id: 1, mission_name: 'LEO-Constellation Alpha', description: 'Low Earth Orbit communication constellation deployment', status: 'active', start_date: '2024-01-15', end_date: '2026-12-31', lead_engineer: 'Dr. Sarah Chen' },
  { mission_id: 2, mission_name: 'GEO-Relay Network', description: 'Geostationary relay satellites for global coverage', status: 'active', start_date: '2023-06-01', end_date: '2027-05-31', lead_engineer: 'James Rodriguez' },
  { mission_id: 3, mission_name: 'Earth-Observation Beta', description: 'Remote sensing and environmental monitoring', status: 'planning', start_date: '2025-03-01', end_date: '2028-02-28', lead_engineer: 'Emily Park' },
];

export const satellites = [
  { sat_id: 101, sat_name: 'ALPHA-1', mission_id: 1, status: 'operational', orbit_type: 'LEO', norad_id: '12345', launch_date: '2024-03-20' },
  { sat_id: 102, sat_name: 'ALPHA-2', mission_id: 1, status: 'operational', orbit_type: 'LEO', norad_id: '12346', launch_date: '2024-03-20' },
  { sat_id: 103, sat_name: 'ALPHA-3', mission_id: 1, status: 'maintenance', orbit_type: 'LEO', norad_id: '12347', launch_date: '2024-06-15' },
  { sat_id: 201, sat_name: 'RELAY-1', mission_id: 2, status: 'operational', orbit_type: 'GEO', norad_id: '23456', launch_date: '2023-08-10' },
  { sat_id: 202, sat_name: 'RELAY-2', mission_id: 2, status: 'operational', orbit_type: 'GEO', norad_id: '23457', launch_date: '2023-11-05' },
  { sat_id: 301, sat_name: 'EO-BETA-1', mission_id: 3, status: 'standby', orbit_type: 'SSO', norad_id: '34567', launch_date: '2025-04-12' },
];

export const payloads = [
  { payload_id: 1001, sat_id: 101, payload_name: 'COMMS-X-Band', payload_type: 'Transponder', status: 'active', mass_kg: 15.2 },
  { payload_id: 1002, sat_id: 102, payload_name: 'COMMS-Ka-Band', payload_type: 'Transponder', status: 'active', mass_kg: 18.5 },
  { payload_id: 1003, sat_id: 201, payload_name: 'RELAY-Payload', payload_type: 'Relay', status: 'active', mass_kg: 45.3 },
  { payload_id: 1004, sat_id: 301, payload_name: 'OPTICAL-Imager', payload_type: 'Imager', status: 'active', mass_kg: 120.7 },
];

export const groundStations = [
  { gs_id: 1, gs_name: 'Austin Ground Station', location: 'Austin, TX, USA', latitude: 30.2672, longitude: -97.7431, status: 'operational', elevation_m: 165 },
  { gs_id: 2, gs_name: 'Madrid Tracking Station', location: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038, status: 'operational', elevation_m: 650 },
  { gs_id: 3, gs_name: 'Singapore Uplink Center', location: 'Singapore', latitude: 1.3521, longitude: 103.8198, status: 'operational', elevation_m: 15 },
];

export const antennas = [
  { ant_id: 501, gs_id: 1, ant_name: 'ANT-A1', status: 'available', frequency_range: '2-18 GHz', diameter_m: 11.3 },
  { ant_id: 502, gs_id: 1, ant_name: 'ANT-A2', status: 'in_use', frequency_range: '4-40 GHz', diameter_m: 13.0 },
  { ant_id: 503, gs_id: 2, ant_name: 'ANT-M1', status: 'available', frequency_range: '2-18 GHz', diameter_m: 9.1 },
  { ant_id: 504, gs_id: 3, ant_name: 'ANT-S1', status: 'available', frequency_range: '8-40 GHz', diameter_m: 7.3 },
  { ant_id: 505, gs_id: 1, ant_name: 'ANT-A3', status: 'maintenance', frequency_range: '2-12 GHz', diameter_m: 11.3 },
];

export const frequencyBands = [
  { band_id: 1, band_name: 'S-Band', frequency_range: '2.0-4.0 GHz', description: 'Telemetry and command' },
  { band_id: 2, band_name: 'X-Band', frequency_range: '8.0-12.0 GHz', description: 'High-rate data downlink' },
  { band_id: 3, band_name: 'Ka-Band', frequency_range: '26.5-40.0 GHz', description: 'High-capacity communications' },
  { band_id: 4, band_name: 'L-Band', frequency_range: '1.0-2.0 GHz', description: 'Navigation and mobile' },
];

export const communicationWindows = [
  { window_id: 10001, sat_id: 101, gs_id: 1, start_time: '2025-10-25T08:30:00Z', end_time: '2025-10-25T09:15:00Z', status: 'predicted', azimuth: 145.2, elevation: 35.8 },
  { window_id: 10002, sat_id: 102, gs_id: 2, start_time: '2025-10-25T14:20:00Z', end_time: '2025-10-25T15:10:00Z', status: 'predicted', azimuth: 210.5, elevation: 42.1 },
  { window_id: 10003, sat_id: 201, gs_id: 3, start_time: '2025-10-25T22:00:00Z', end_time: '2025-10-25T23:30:00Z', status: 'predicted', azimuth: 95.7, elevation: 28.4 },
  { window_id: 10004, sat_id: 103, gs_id: 1, start_time: '2025-10-26T10:45:00Z', end_time: '2025-10-26T11:25:00Z', status: 'predicted', azimuth: 165.3, elevation: 38.9 },
];

export const communicationSessions = [
  { session_id: 'CS-2025-001', window_id: 10001, sat_id: 101, gs_id: 1, ant_id: 502, band_id: 2, start_time: '2025-10-25T08:30:00Z', end_time: '2025-10-25T09:15:00Z', status: 'scheduled', operator: 'Mike Johnson' },
  { session_id: 'CS-2025-002', window_id: 10002, sat_id: 102, gs_id: 2, ant_id: 503, band_id: 3, start_time: '2025-10-25T14:20:00Z', end_time: '2025-10-25T15:10:00Z', status: 'in_progress', operator: 'Lisa Wang' },
  { session_id: 'CS-2025-003', window_id: 10003, sat_id: 201, gs_id: 3, ant_id: 504, band_id: 2, start_time: '2025-10-25T22:00:00Z', end_time: '2025-10-25T23:30:00Z', status: 'completed', operator: 'Tom Baker' },
];

export const schedulingRecommendations = [
  { rec_id: 5001, sat_id: 103, gs_id: 1, window_id: 10004, proposed_start: '2025-10-26T10:45:00Z', proposed_end: '2025-10-26T11:25:00Z', band_id: 2, rationale: 'Optimal elevation angle and minimal RF interference predicted', status: 'pending', confidence_score: 0.92 },
  { rec_id: 5002, sat_id: 101, gs_id: 2, proposed_start: '2025-10-26T16:30:00Z', proposed_end: '2025-10-26T17:20:00Z', band_id: 3, rationale: 'Load balancing across ground stations for mission efficiency', status: 'pending', confidence_score: 0.87 },
];

export const engineers = [
  { eng_id: 1, eng_name: 'Mike Johnson', role: 'Lead Operator', email: 'mike.johnson@satlink.com', status: 'active', specialization: 'LEO Operations' },
  { eng_id: 2, eng_name: 'Lisa Wang', role: 'RF Engineer', email: 'lisa.wang@satlink.com', status: 'active', specialization: 'RF Systems' },
  { eng_id: 3, eng_name: 'Tom Baker', role: 'Mission Controller', email: 'tom.baker@satlink.com', status: 'active', specialization: 'Mission Planning' },
  { eng_id: 4, eng_name: 'Sarah Chen', role: 'Systems Engineer', email: 'sarah.chen@satlink.com', status: 'on_call', specialization: 'Systems Integration' },
];

export const engineerAssignments = [
  { assign_id: 1, eng_id: 1, session_id: 'CS-2025-001', role: 'Primary Operator', assigned_at: '2025-10-24T09:00:00Z' },
  { assign_id: 2, eng_id: 2, session_id: 'CS-2025-002', role: 'RF Support', assigned_at: '2025-10-24T10:30:00Z' },
  { assign_id: 3, eng_id: 3, session_id: 'CS-2025-003', role: 'Mission Controller', assigned_at: '2025-10-24T11:15:00Z' },
];

export const maintenanceLogs = [
  { maint_id: 1, ant_id: 505, gs_id: 1, maint_type: 'Preventive', description: 'Annual antenna calibration and RF testing', start_date: '2025-10-26T00:00:00Z', end_date: '2025-10-27T18:00:00Z', status: 'scheduled', eng_id: 4 },
  { maint_id: 2, ant_id: 501, gs_id: 1, maint_type: 'Corrective', description: 'Replace faulty waveguide component', start_date: '2025-10-20T08:00:00Z', end_date: '2025-10-20T16:00:00Z', status: 'completed', eng_id: 2 },
];

export const weatherRecords = [
  { weather_id: 1, gs_id: 1, observation_time: '2025-10-25T06:00:00Z', temperature_c: 22.5, humidity_percent: 45, wind_speed_kmh: 12, precipitation_mm: 0, cloud_cover_percent: 15, conditions: 'Clear' },
  { weather_id: 2, gs_id: 2, observation_time: '2025-10-25T06:00:00Z', temperature_c: 18.2, humidity_percent: 62, wind_speed_kmh: 8, precipitation_mm: 0, cloud_cover_percent: 25, conditions: 'Partly Cloudy' },
  { weather_id: 3, gs_id: 3, observation_time: '2025-10-25T06:00:00Z', temperature_c: 31.4, humidity_percent: 78, wind_speed_kmh: 15, precipitation_mm: 2.3, cloud_cover_percent: 60, conditions: 'Light Rain' },
];

export const commandLogs = [
  { cmd_id: 1, session_id: 'CS-2025-003', sat_id: 201, command_type: 'ORBIT_MAINTENANCE', timestamp: '2025-10-25T22:15:00Z', status: 'executed', sent_by: 3, details: 'Station keeping maneuver command sequence' },
  { cmd_id: 1, session_id: 'CS-2025-003', sat_id: 201, command_type: 'ORBIT_MAINTENANCE', timestamp: '2025-10-25T22:15:00Z', status: 'executed', sent_by: 3, details: 'Station keeping maneuver command sequence' },
  { cmd_id: 2, session_id: 'CS-2025-002', sat_id: 102, command_type: 'PAYLOAD_CONFIG', timestamp: '2025-10-25T14:35:00Z', status: 'executed', sent_by: 2, details: 'Configure transponder for high-rate downlink' },
];

export const telemetryLogs = [
  { tel_id: 1, sat_id: 101, session_id: 'CS-2025-001', timestamp: '2025-10-25T08:35:00Z', measurement_type: 'Battery_Voltage', value: 28.4, unit: 'V' },
  { tel_id: 2, sat_id: 101, session_id: 'CS-2025-001', timestamp: '2025-10-25T08:40:00Z', measurement_type: 'Temperature', value: 15.2, unit: '°C' },
  { tel_id: 3, sat_id: 101, session_id: 'CS-2025-001', timestamp: '2025-10-25T08:45:00Z', measurement_type: 'Power_Output', value: 850.3, unit: 'W' },
  { tel_id: 4, sat_id: 102, session_id: 'CS-2025-002', timestamp: '2025-10-25T14:25:00Z', measurement_type: 'Battery_Voltage', value: 27.9, unit: 'V' },
  { tel_id: 5, sat_id: 102, session_id: 'CS-2025-002', timestamp: '2025-10-25T14:30:00Z', measurement_type: 'Temperature', value: 18.7, unit: '°C' },
  { tel_id: 6, sat_id: 201, session_id: 'CS-2025-003', timestamp: '2025-10-25T22:05:00Z', measurement_type: 'Battery_Voltage', value: 28.1, unit: 'V' },
];

export const alerts = [
  { alert_id: 1, severity: 'warning', category: 'Weather', description: 'Precipitation detected at Singapore station - possible link degradation', timestamp: '2025-10-25T05:30:00Z', status: 'unread', related_entity: 'GroundStation', entity_id: 3 },
  { alert_id: 2, severity: 'info', category: 'Maintenance', description: 'Antenna ANT-A3 scheduled for maintenance starting Oct 26', timestamp: '2025-10-25T09:15:00Z', status: 'acknowledged', related_entity: 'Antenna', entity_id: 505 },
  { alert_id: 3, severity: 'critical', category: 'Resource', description: 'ANT-A2 conflict detected for overlapping session requests', timestamp: '2025-10-25T13:45:00Z', status: 'unread', related_entity: 'Antenna', entity_id: 502 },
];

export const users = [
  { user_id: 1, username: 'admin', full_name: 'System Administrator', email: 'admin@satlink.com', role: 'Administrator', status: 'active' },
  { user_id: 2, username: 'operator1', full_name: 'Mike Johnson', email: 'mike.johnson@satlink.com', role: 'Operator', status: 'active' },
  { user_id: 3, username: 'engineer1', full_name: 'Lisa Wang', email: 'lisa.wang@satlink.com', role: 'Engineer', status: 'active' },
];

export const dashboardStats = {
  totalMissions: missions.length,
  activeSatellites: satellites.filter(s => s.status === 'operational').length,
  totalGroundStations: groundStations.length,
  availableAntennas: antennas.filter(a => a.status === 'available').length,
  upcomingSessions: communicationSessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress').length,
  activeAlerts: alerts.filter(a => a.status === 'unread').length,
};

export const telemetryTrendData = [
  { time: '08:30', battery: 28.5, temp: 14.8, power: 845 },
  { time: '08:35', battery: 28.4, temp: 15.2, power: 850 },
  { time: '08:40', battery: 28.4, temp: 15.6, power: 848 },
  { time: '08:45', battery: 28.3, temp: 16.1, power: 852 },
  { time: '08:50', battery: 28.3, temp: 16.4, power: 847 },
  { time: '08:55', battery: 28.2, temp: 16.8, power: 851 },
  { time: '09:00', battery: 28.2, temp: 17.2, power: 846 },
];

export const sessionsByStatus = [
  { name: 'Completed', value: 1, color: '#22c55e' },
  { name: 'In Progress', value: 1, color: '#f59e0b' },
  { name: 'Scheduled', value: 1, color: '#3b82f6' },
];

export const stationUtilization = [
  { station: 'Austin', sessions: 2, utilization: 65 },
  { station: 'Madrid', sessions: 1, utilization: 45 },
  { station: 'Singapore', sessions: 1, utilization: 55 },
];
