import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DataTable from '../components/common/DataTable';
import Toast from '../components/common/Toast';
import { useData } from '../context/DataContext';
import './Alerts.css';

const Alerts = () => {
  const { getAll, update } = useData();
  const alerts = getAll('alerts');
  const [toast, setToast] = useState(null);

  const setStatus = (alert, status) => {
    update('alerts', 'alert_id', alert.alert_id, { status });
    setToast({ message: `Alert #${alert.alert_id} ${status}`, type: status === 'resolved' ? 'success' : 'info' });
  };

  const columns = [
    { header: 'ID', accessor: 'alert_id', width: '70px' },
    { header: 'Severity', accessor: 'severity', render: (v) => <Badge variant={v === 'critical' ? 'danger' : v === 'warning' ? 'warning' : 'info'}>{v}</Badge> },
    { header: 'Category', accessor: 'category' },
    { header: 'Description', accessor: 'description', render: (v) => <span className="description-cell">{v}</span> },
    { header: 'Time', accessor: 'timestamp', render: (v) => new Date(v).toLocaleString() },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'unread' ? 'warning' : v === 'acknowledged' ? 'info' : 'success'}>{v}</Badge> },
    { header: 'Actions', accessor: 'actions', sortable: false, render: (_, row) => (
      <div className="action-buttons">
        {row.status === 'unread' && (
          <Button variant="ghost" size="sm" icon={CheckCircle} onClick={() => setStatus(row, 'acknowledged')}>Acknowledge</Button>
        )}
        {row.status !== 'resolved' && (
          <Button variant="ghost" size="sm" icon={XCircle} onClick={() => setStatus(row, 'resolved')}>Resolve</Button>
        )}
        {row.status === 'resolved' && <span className="resolved-text">Resolved</span>}
      </div>
    )},
  ];

  const unread = alerts.filter(a => a.status === 'unread').length;

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">System notifications, warnings and operational events</p>
        </div>
        {unread > 0 && <Badge variant="warning">{unread} unread</Badge>}
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={alerts}
          rowKey={(r) => r.alert_id}
          searchPlaceholder="Search alerts..."
          filters={[
            { key: 'severity', accessor: 'severity', label: 'Severity', options: [
              { value: 'critical', label: 'Critical' },
              { value: 'warning', label: 'Warning' },
              { value: 'info', label: 'Info' },
            ]},
            { key: 'status', accessor: 'status', label: 'Status', options: [
              { value: 'unread', label: 'Unread' },
              { value: 'acknowledged', label: 'Acknowledged' },
              { value: 'resolved', label: 'Resolved' },
            ]},
          ]}
          emptyMessage="No alerts — all clear."
        />
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Alerts;
