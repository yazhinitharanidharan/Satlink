import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';
import { useData } from '../context/DataContext';
import './Scheduling.css';

const toDateInputValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const overlaps = (first, second) =>
  new Date(first.start_time) < new Date(second.end_time) &&
  new Date(first.end_time) > new Date(second.start_time);

const Scheduling = () => {
  const navigate = useNavigate();
  const { getAll, update } = useData();
  const sessions = getAll('communicationSessions');
  const recommendations = getAll('schedulingRecommendations');
  const satellites = getAll('satellites');
  const groundStations = getAll('groundStations');
  const antennas = getAll('antennas');
  const bands = getAll('frequencyBands');
  const maintenanceLogs = getAll('maintenanceLogs');

  const [selectedDate, setSelectedDate] = useState(() =>
    toDateInputValue(new Date())
  );
  const [toast, setToast] = useState(null);

  const daySessions = sessions.filter(
    (session) => toDateInputValue(session.start_time) === selectedDate
  );

  const conflicts = useMemo(() => {
    const found = [];
    const activeSessions = sessions.filter((session) =>
      ['scheduled', 'in_progress'].includes(session.status)
    );

    for (let i = 0; i < activeSessions.length; i += 1) {
      for (let j = i + 1; j < activeSessions.length; j += 1) {
        const first = activeSessions[i];
        const second = activeSessions[j];

        if (
          first.ant_id != null &&
          first.ant_id === second.ant_id &&
          overlaps(first, second)
        ) {
          found.push({ first, second });
        }
      }
    }

    return found.slice(0, 4);
  }, [sessions]);

  const plannedMaintenance = maintenanceLogs
    .filter((log) => ['scheduled', 'in_progress'].includes(log.status))
    .slice(0, 3);

  const decide = async (recommendation, status) => {
    try {
      await update(
        'schedulingRecommendations',
        'rec_id',
        recommendation.rec_id,
        { status }
      );
      setToast({
        message: `Recommendation #${recommendation.rec_id} ${status}`,
        type: status === 'accepted' ? 'success' : 'warning',
      });
    } catch (error) {
      setToast({
        message: error?.message || 'Unable to update recommendation.',
        type: 'error',
      });
    }
  };

  const sessionColumns = [
    { header: 'Session ID', accessor: 'session_id' },
    { header: 'Satellite', accessor: 'sat_id', render: (val) => satellites.find(s => s.sat_id === val)?.sat_name || '—' },
    { header: 'Ground Station', accessor: 'gs_id', render: (val) => groundStations.find(g => g.gs_id === val)?.gs_name || '—' },
    { header: 'Antenna', accessor: 'ant_id', render: (val) => antennas.find(a => a.ant_id === val)?.ant_name || '—' },
    { header: 'Time', accessor: 'start_time', render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
    { header: 'Status', accessor: 'status', render: (val) => (
      <Badge variant={val === 'completed' ? 'success' : val === 'in_progress' ? 'warning' : 'info'}>
        {(val || 'scheduled').replace('_', ' ')}
      </Badge>
    )},
    { header: 'Operator', accessor: 'operator', render: (val) => val || '—' },
  ];

  const recColumns = [
    { header: 'Rec ID', accessor: 'rec_id' },
    { header: 'Satellite', accessor: 'sat_id', render: (val) => satellites.find(s => s.sat_id === val)?.sat_name || '—' },
    { header: 'Time', accessor: 'proposed_start', render: (val) => val ? new Date(val).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
    { header: 'Band', accessor: 'band_id', render: (val) => bands.find(b => b.band_id === val)?.band_name || '—' },
    { header: 'Confidence', accessor: 'confidence_score', render: (val) => val != null ? `${(Number(val) * 100).toFixed(0)}%` : '—' },
    { header: 'Status', accessor: 'status', render: (val) => (
      <Badge variant={val === 'accepted' ? 'success' : val === 'rejected' ? 'danger' : 'warning'}>
        {val || 'pending'}
      </Badge>
    )},
    { header: 'Actions', accessor: 'actions', sortable: false, render: (_, row) => (
      row.status === 'pending' ? (
        <div className="action-buttons">
          <Button variant="success" size="sm" icon={CheckCircle} onClick={() => { decide(row, 'accepted'); }}>Accept</Button>
          <Button variant="danger" size="sm" icon={XCircle} onClick={() => { decide(row, 'rejected'); }}>Reject</Button>
        </div>
      ) : <span className="processed-text">Processed</span>
    )},
  ];

  return (
    <div className="scheduling-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication Scheduling</h1>
          <p className="page-subtitle">Plan and manage satellite communication sessions</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/communication-sessions')}>
          Schedule New Session
        </Button>
      </div>

      <div className="scheduling-grid">
        <Card title="Schedule Overview" subtitle="Timeline view" className="timeline-card">
          <div className="date-selector">
            <label>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="timeline">
            <div className="timeline-header">
              <div className="time-slot">00:00</div>
              <div className="time-slot">06:00</div>
              <div className="time-slot">12:00</div>
              <div className="time-slot">18:00</div>
            </div>
            <div className="timeline-body">
              {daySessions.length === 0 ? (
                <div className="timeline-empty">No sessions scheduled for this date.</div>
              ) : daySessions.map(session => (
                <div key={session.session_id} className={`timeline-event status-${session.status}`}>
                  <div className="event-time">
                    {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="event-details">
                    <strong>{satellites.find(s => s.sat_id === session.sat_id)?.sat_name || 'Unknown satellite'}</strong>
                    {' → '}
                    {groundStations.find(g => g.gs_id === session.gs_id)?.gs_name || 'Unknown station'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Conflict Warnings" subtitle="Resource allocation issues" className="conflicts-card">
          {conflicts.length === 0 ? (
            <div className="conflict-empty">
              <CheckCircle size={18} />
              <span>No antenna conflicts detected.</span>
            </div>
          ) : conflicts.map(({ first, second }) => (
            <div className="conflict-item warning" key={`${first.session_id}-${second.session_id}`}>
              <AlertTriangle size={18} />
              <div>
                <strong>{antennas.find(a => a.ant_id === first.ant_id)?.ant_name || `Antenna ${first.ant_id}`} overlap</strong>
                <p>Sessions #{first.session_id} and #{second.session_id} use the same antenna at overlapping times.</p>
              </div>
            </div>
          ))}

          {plannedMaintenance.map((log) => (
            <div className="conflict-item info" key={log.maint_id}>
              <Clock size={18} />
              <div>
                <strong>{antennas.find(a => a.ant_id === log.ant_id)?.ant_name || `Antenna ${log.ant_id}`} maintenance</strong>
                <p>{log.maint_type} · {log.start_date ? new Date(log.start_date).toLocaleString() : 'Date TBD'}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Scheduled Sessions" subtitle="All communication sessions">
        <Table columns={sessionColumns} data={sessions} />
      </Card>

      <Card title="Scheduling Recommendations" subtitle="Stored scheduling suggestions">
        <Table columns={recColumns} data={recommendations} />
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Scheduling;
