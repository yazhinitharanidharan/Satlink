import { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import { communicationSessions, schedulingRecommendations, satellites, groundStations, antennas } from '../data/mockData';
import './Scheduling.css';

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState('2025-10-25');

  const sessionColumns = [
    { header: 'Session ID', accessor: 'session_id' },
    { header: 'Satellite', accessor: 'sat_id', render: (val) => satellites.find(s => s.sat_id === val)?.sat_name },
    { header: 'Ground Station', accessor: 'gs_id', render: (val) => groundStations.find(g => g.gs_id === val)?.gs_name },
    { header: 'Antenna', accessor: 'ant_id', render: (val) => antennas.find(a => a.ant_id === val)?.ant_name },
    { header: 'Time', accessor: 'start_time', render: (val) => new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
    { header: 'Status', accessor: 'status', render: (val) => (
      <Badge variant={val === 'completed' ? 'success' : val === 'in_progress' ? 'warning' : 'info'}>
        {val.replace('_', ' ')}
      </Badge>
    )},
    { header: 'Operator', accessor: 'operator' },
  ];

  const recColumns = [
    { header: 'Rec ID', accessor: 'rec_id' },
    { header: 'Satellite', accessor: 'sat_id', render: (val) => satellites.find(s => s.sat_id === val)?.sat_name },
    { header: 'Time', accessor: 'proposed_start', render: (val) => new Date(val).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) },
    { header: 'Confidence', accessor: 'confidence_score', render: (val) => `${(val * 100).toFixed(0)}%` },
    { header: 'Status', accessor: 'status', render: (val) => (
      <Badge variant={val === 'accepted' ? 'success' : val === 'rejected' ? 'danger' : 'warning'}>
        {val}
      </Badge>
    )},
    { header: 'Actions', accessor: 'actions', render: () => (
      <div className="action-buttons">
        <Button variant="success" size="sm" icon={CheckCircle}>Accept</Button>
        <Button variant="danger" size="sm">Reject</Button>
      </div>
    )},
  ];

  return (
    <div className="scheduling-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication Scheduling</h1>
          <p className="page-subtitle">Plan and manage satellite communication sessions</p>
        </div>
        <Button icon={Plus}>Schedule New Session</Button>
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
              {communicationSessions.map(session => (
                <div key={session.session_id} className={`timeline-event status-${session.status}`}>
                  <div className="event-time">
                    {new Date(session.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </div>
                  <div className="event-details">
                    <strong>{satellites.find(s => s.sat_id === session.sat_id)?.sat_name}</strong> → {groundStations.find(g => g.gs_id === session.gs_id)?.gs_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Conflict Warnings" subtitle="Resource allocation issues" className="conflicts-card">
          <div className="conflict-item warning">
            <AlertTriangle size={18} />
            <div>
              <strong>ANT-A2 Overlap</strong>
              <p>Potential scheduling conflict detected for antenna ANT-A2</p>
            </div>
          </div>
          <div className="conflict-item info">
            <Clock size={18} />
            <div>
              <strong>Maintenance Window</strong>
              <p>ANT-A3 unavailable Oct 26-27 for scheduled maintenance</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Scheduled Sessions" subtitle="All communication sessions">
        <Table columns={sessionColumns} data={communicationSessions} />
      </Card>

      <Card title="Scheduling Recommendations" subtitle="AI-assisted optimization suggestions (Demo)" action={<span style={{fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>Simulated recommendations</span>}>
        <Table columns={recColumns} data={schedulingRecommendations} />
      </Card>
    </div>
  );
};

export default Scheduling;
