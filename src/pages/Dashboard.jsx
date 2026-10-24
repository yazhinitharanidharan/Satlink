import { Link, useNavigate } from 'react-router-dom';
import { Activity, Satellite, Radio, Antenna, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';
import './Dashboard.css';

const Dashboard = () => {
  const { getAll } = useData();
  const navigate = useNavigate();

  const missions = getAll('missions');
  const satellites = getAll('satellites');
  const groundStations = getAll('groundStations');
  const antennas = getAll('antennas');
  const sessions = getAll('communicationSessions');
  const alerts = getAll('alerts');
  const telemetry = getAll('telemetryLogs');
  const bands = getAll('frequencyBands');

  const stats = [
    { label: 'Total Missions', value: missions.length, icon: Activity, tone: 'missions', path: '/missions' },
    { label: 'Active Satellites', value: satellites.filter(s => s.status === 'operational').length, icon: Satellite, tone: 'satellites', path: '/satellites' },
    { label: 'Ground Stations', value: groundStations.length, icon: Radio, tone: 'stations', path: '/ground-stations' },
    { label: 'Available Antennas', value: antennas.filter(a => a.status === 'available').length, icon: Antenna, tone: 'antennas', path: '/antennas' },
    { label: 'Upcoming Sessions', value: sessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress').length, icon: Calendar, tone: 'sessions', path: '/scheduling' },
    { label: 'Active Alerts', value: alerts.filter(a => a.status === 'unread').length, icon: AlertTriangle, tone: 'alerts', path: '/alerts' },
  ];

  const statusColors = { completed: '#22c55e', in_progress: '#f59e0b', scheduled: '#3b82f6', cancelled: '#ef4444' };
  const sessionsByStatus = Object.entries(
    sessions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value, color: statusColors[name] || '#64748b' }));

  const stationUtilization = groundStations.map(gs => {
    const stationSessions = sessions.filter(s => s.gs_id === gs.gs_id);
    const stationAntennas = antennas.filter(a => a.gs_id === gs.gs_id);
    const usedAntennas = new Set(stationSessions.map(s => s.ant_id)).size;
    return {
      station: gs.gs_name.split(' ')[0],
      sessions: stationSessions.length,
      utilization: stationAntennas.length ? Math.round((usedAntennas / stationAntennas.length) * 100) : 0,
    };
  });

  const telemetryTrendData = telemetry
    .filter(t => t.measurement_type === 'Battery_Voltage')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(0, 12)
    .map(t => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      battery: t.value,
    }));

  const upcomingSessions = [...sessions]
    .filter(s => s.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 6);

  const recentEvents = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);

  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Mission Control Dashboard</h1>
          <p className="page-subtitle">Operational overview from the local demonstration dataset — not live telemetry.</p>
        </div>
        <Badge variant="warning">Demo data</Badge>
      </div>

      <div className="stats-grid">
        {stats.map(stat => (
          <button
            key={stat.label}
            className="stat-card card"
            onClick={() => navigate(stat.path)}
            aria-label={`${stat.label}: ${stat.value}. Go to ${stat.label}.`}
          >
            <div className="stat-content">
              <div className={`stat-icon ${stat.tone}`}>
                <stat.icon size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card title="Satellite Telemetry Trend" subtitle="Battery voltage — sample demonstration data" className="chart-card">
          {telemetryTrendData.length === 0 ? (
            <div className="chart-placeholder">No telemetry records available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={telemetryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                <Legend />
                <Line type="monotone" dataKey="battery" name="Battery (V)" stroke="var(--accent-success)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Communication Sessions by Status" subtitle="Distribution overview" className="chart-card">
          {sessionsByStatus.length === 0 ? (
            <div className="chart-placeholder">No sessions recorded.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sessionsByStatus} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={90} dataKey="value">
                  {sessionsByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Ground Station Utilization" subtitle="Sessions and antenna usage" className="chart-card">
          {stationUtilization.length === 0 ? (
            <div className="chart-placeholder">No ground stations recorded.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stationUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="station" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                <Legend />
                <Bar dataKey="sessions" fill="var(--accent-primary)" name="Sessions" />
                <Bar dataKey="utilization" fill="var(--accent-secondary)" name="Antenna usage %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="dashboard-bottom">
        <Card
          title="Upcoming Communication Sessions"
          subtitle="Next scheduled operations"
          action={<Link to="/scheduling" className="card-link">View all <ArrowRight size={13} /></Link>}
          className="sessions-card"
        >
          {upcomingSessions.length === 0 ? (
            <div className="table-empty">No upcoming sessions.</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Satellite</th>
                    <th>Station</th>
                    <th>Start</th>
                    <th>Band</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSessions.map(s => (
                    <tr key={s.session_id} className="table-row-clickable" onClick={() => navigate('/communication-sessions')}>
                      <td>{s.session_id}</td>
                      <td>{satellites.find(x => x.sat_id === s.sat_id)?.sat_name || '—'}</td>
                      <td>{groundStations.find(x => x.gs_id === s.gs_id)?.gs_name || '—'}</td>
                      <td>{new Date(s.start_time).toLocaleString()}</td>
                      <td>{bands.find(b => b.band_id === s.band_id)?.band_name || '—'}</td>
                      <td><Badge variant={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'warning' : 'info'}>{s.status.replace('_', ' ')}</Badge></td>
                      <td><ArrowRight size={14} className="row-arrow" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Recent Operational Events"
          subtitle="Alerts and system events"
          action={<Link to="/alerts" className="card-link">View all <ArrowRight size={13} /></Link>}
          className="events-card"
        >
          {recentEvents.length === 0 ? (
            <div className="table-empty">No recent events.</div>
          ) : (
            <div className="event-list">
              {recentEvents.map(alert => (
                <button key={alert.alert_id} className="event-item" onClick={() => navigate('/alerts')}>
                  <span className={`event-dot severity-${alert.severity}`} aria-hidden="true" />
                  <div className="event-body">
                    <div className="event-text">{alert.description}</div>
                    <div className="event-meta">{alert.category} · {new Date(alert.timestamp).toLocaleString()}</div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'} size="sm">{alert.severity}</Badge>
                </button>
              ))}
            </div>
          )}
          {unreadAlerts > 0 && (
            <div className="events-footer">
              <Link to="/alerts" className="card-link">{unreadAlerts} unread alert(s) — review</Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
