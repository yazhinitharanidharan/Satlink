import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DataTable from '../components/common/DataTable';
import Toast from '../components/common/Toast';
import { useData } from '../context/DataContext';
import './SchedulingRecommendations.css';

const SchedulingRecommendations = () => {
  const { getAll, update } = useData();
  const recommendations = getAll('schedulingRecommendations');
  const satellites = getAll('satellites');
  const stations = getAll('groundStations');
  const bands = getAll('frequencyBands');
  const [toast, setToast] = useState(null);

  const decide = (rec, status) => {
    update('schedulingRecommendations', 'rec_id', rec.rec_id, { status });
    setToast({ message: `Recommendation #${rec.rec_id} ${status}`, type: status === 'accepted' ? 'success' : 'warning' });
  };

  const columns = [
    { header: 'Rec ID', accessor: 'rec_id', width: '80px' },
    { header: 'Satellite', accessor: 'sat_id', render: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { header: 'Station', accessor: 'gs_id', render: (v) => stations.find(s => s.gs_id === v)?.gs_name || 'TBD' },
    { header: 'Proposed Start', accessor: 'proposed_start', render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { header: 'Band', accessor: 'band_id', render: (v) => bands.find(b => b.band_id === v)?.band_name || '—' },
    { header: 'Confidence', accessor: 'confidence_score', render: (v) => <Badge variant={v >= 0.9 ? 'success' : v >= 0.8 ? 'warning' : 'info'}>{(v * 100).toFixed(0)}%</Badge> },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'accepted' ? 'success' : v === 'rejected' ? 'danger' : 'warning'}>{v}</Badge> },
    { header: 'Actions', accessor: 'actions', sortable: false, render: (_, row) => (
      row.status === 'pending' ? (
        <div className="action-buttons">
          <Button variant="success" size="sm" icon={CheckCircle} onClick={() => decide(row, 'accepted')}>Accept</Button>
          <Button variant="danger" size="sm" icon={XCircle} onClick={() => decide(row, 'rejected')}>Reject</Button>
        </div>
      ) : <span className="processed-text">Processed</span>
    )},
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scheduling Recommendations</h1>
          <p className="page-subtitle">Simulated scheduling suggestions. These are demonstration recommendations, not a live AI engine.</p>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="stat-card"><div className="stat-content"><div className="stat-info"><div className="stat-value">{recommendations.length}</div><div className="stat-label">Total Recommendations</div></div></div></Card>
        <Card className="stat-card"><div className="stat-content"><div className="stat-info"><div className="stat-value">{recommendations.filter(r => r.status === 'pending').length}</div><div className="stat-label">Pending</div></div></div></Card>
        <Card className="stat-card"><div className="stat-content"><div className="stat-info"><div className="stat-value">{recommendations.filter(r => r.status === 'accepted').length}</div><div className="stat-label">Accepted</div></div></div></Card>
        <Card className="stat-card"><div className="stat-content"><div className="stat-info"><div className="stat-value">{recommendations.filter(r => r.status === 'rejected').length}</div><div className="stat-label">Rejected</div></div></div></Card>
      </div>

      <Card title="Recommendations" subtitle="Accepting a recommendation is a demo operation and does not create a session.">
        <DataTable
          columns={columns}
          data={recommendations}
          rowKey={(r) => r.rec_id}
          searchPlaceholder="Search recommendations..."
          filters={[{ key: 'status', accessor: 'status', label: 'Status', options: [
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'rejected', label: 'Rejected' },
          ]}]}
        />
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SchedulingRecommendations;
