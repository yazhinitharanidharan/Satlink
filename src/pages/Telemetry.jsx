import { useState } from 'react';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import FormField from '../components/common/FormField';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { useData } from '../context/DataContext';
import './Telemetry.css';

const Telemetry = () => {
  const { getAll, create, remove } = useData();
  const logs = getAll('telemetryLogs');
  const satellites = getAll('satellites');
  const sessions = getAll('communicationSessions');

  const [typeFilter, setTypeFilter] = useState('all');
  const [satFilter, setSatFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [values, setValues] = useState({ measurement_type: 'Battery_Voltage', unit: 'V' });
  const [errors, setErrors] = useState({});

  const loggedTypes = [...new Set(logs.map(l => l.measurement_type))];
  const types = loggedTypes.length
    ? loggedTypes
    : ['Battery_Voltage', 'Temperature', 'Power_Output'];

  const chartData = logs
    .filter(l => typeFilter === 'all' || l.measurement_type === typeFilter)
    .filter(l => satFilter === 'all' || String(l.sat_id) === String(satFilter))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(l => ({
      time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: l.value,
      satellite: satellites.find(s => s.sat_id === l.sat_id)?.sat_name || l.sat_id,
    }));

  const columns = [
    { header: 'ID', accessor: 'tel_id', width: '70px' },
    { header: 'Satellite', accessor: 'sat_id', render: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { header: 'Session', accessor: 'session_id' },
    { header: 'Timestamp', accessor: 'timestamp', render: (v) => new Date(v).toLocaleString() },
    { header: 'Measurement', accessor: 'measurement_type' },
    { header: 'Value', accessor: 'value', render: (v, row) => `${v} ${row.unit}` },
    { header: 'Actions', accessor: 'actions', sortable: false, render: (_, row) => (
      <div className="action-buttons">
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setDetail(row)}>View</Button>
        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleting(row)}>Delete</Button>
      </div>
    )},
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.session_id) errs.session_id = 'Session is required';
    if (!values.timestamp) errs.timestamp = 'Timestamp is required';
    if (values.value === '' || values.value == null) errs.value = 'Value is required';
    if (!values.measurement_type) errs.measurement_type = 'Measurement type is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      await create('telemetryLogs', {
        session_id: values.session_id,
        timestamp: values.timestamp,
        measurement_type: values.measurement_type,
        value: Number(values.value),
        unit: values.unit || '',
      });
      setCreateOpen(false);
      setValues({ measurement_type: 'Battery_Voltage', unit: 'V' });
      setToast({ message: 'Telemetry record created', type: 'success' });
    } catch (error) {
      setToast({
        message: error?.message || 'Unable to create telemetry record.',
        type: 'error',
      });
    }
  };

  return (
    <div className="telemetry-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Telemetry</h1>
          <p className="page-subtitle">Spacecraft health and performance records stored in SATLINK.</p>
        </div>
        <Button icon={Plus} onClick={() => { setValues({ measurement_type: types[0] || 'Battery_Voltage', unit: 'V' }); setErrors({}); setCreateOpen(true); }}>Add Record</Button>
      </div>

      <div className="stats-grid">
        <Card className="stat-card"><div className="stat-content"><div className="stat-info"><div className="stat-value">{logs.length}</div><div className="stat-label">Telemetry Records</div></div></div></Card>
        <Card className="stat-card"><div className="stat-content"><div className="stat-info"><div className="stat-value">{loggedTypes.length}</div><div className="stat-label">Measurement Types</div></div></div></Card>
        <Card className="stat-card"><div className="stat-content"><div className="stat-info"><div className="stat-value">{new Set(logs.map(l => l.sat_id)).size}</div><div className="stat-label">Satellites Reporting</div></div></div></Card>
      </div>

      <Card title="Telemetry Trend" subtitle="Filtered time series">
        <div className="chart-filters">
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Measurement type">
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={satFilter} onChange={(e) => setSatFilter(e.target.value)} aria-label="Satellite">
            <option value="all">All Satellites</option>
            {satellites.map(s => <option key={s.sat_id} value={s.sat_id}>{s.sat_name}</option>)}
          </select>
        </div>
        {chartData.length === 0 ? (
          <div className="chart-empty">No telemetry records match the selected filters.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
              <Legend />
              <Line type="monotone" dataKey="value" name={typeFilter === 'all' ? 'Value' : typeFilter} stroke="var(--accent-primary)" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Telemetry Records" subtitle="All measurements">
        <DataTable
          columns={columns}
          data={logs}
          rowKey={(r) => r.tel_id}
          searchPlaceholder="Search telemetry..."
          filters={[
            { key: 'type', accessor: 'measurement_type', label: 'Type', options: types.map(t => ({ value: t, label: t })) },
            { key: 'sat', accessor: 'sat_id', label: 'Satellite', options: satellites.map(s => ({ value: s.sat_id, label: s.sat_name })) },
          ]}
        />
      </Card>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Telemetry Record" size="md">
        <form onSubmit={handleCreate} noValidate>
          <div className="form-grid">
            <FormField label="Session" name="session_id" type="select" value={values.session_id || ''} onChange={(e) => setValues(v => ({ ...v, session_id: e.target.value }))} error={errors.session_id} required options={sessions.map(s => ({ value: s.session_id, label: `#${s.session_id}` }))} />
            <FormField label="Timestamp" name="timestamp" type="datetime-local" value={values.timestamp || ''} onChange={(e) => setValues(v => ({ ...v, timestamp: e.target.value }))} error={errors.timestamp} required />
            <FormField label="Measurement Type" name="measurement_type" type="select" value={values.measurement_type || ''} onChange={(e) => setValues(v => ({ ...v, measurement_type: e.target.value }))} error={errors.measurement_type} required options={types.map(t => ({ value: t, label: t }))} />
            <FormField label="Value" name="value" type="number" value={values.value ?? ''} onChange={(e) => setValues(v => ({ ...v, value: e.target.value }))} error={errors.value} required />
            <FormField label="Unit" name="unit" type="text" value={values.unit || ''} onChange={(e) => setValues(v => ({ ...v, unit: e.target.value }))} placeholder="e.g. V, °C, W" />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit">Save Record</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Telemetry Record" size="md">
        {detail && (
          <div className="detail-list">
            <div><span>Record ID</span><strong>{detail.tel_id}</strong></div>
            <div><span>Satellite</span><strong>{satellites.find(s => s.sat_id === detail.sat_id)?.sat_name || detail.sat_id}</strong></div>
            <div><span>Session</span><strong>{detail.session_id || '—'}</strong></div>
            <div><span>Timestamp</span><strong>{new Date(detail.timestamp).toLocaleString()}</strong></div>
            <div><span>Measurement</span><strong>{detail.measurement_type}</strong></div>
            <div><span>Value</span><strong>{detail.value} {detail.unit}</strong></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete Telemetry Record"
        message={deleting ? `Delete measurement ${deleting.tel_id} (${deleting.measurement_type})? This action cannot be undone.` : ''}
        confirmText="Delete"
        confirmVariant="danger"
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;

          try {
            await remove('telemetryLogs', 'tel_id', deleting.tel_id);
            setToast({ message: 'Telemetry record deleted', type: 'success' });
          } catch (error) {
            setToast({
              message: error?.message || 'Unable to delete telemetry record.',
              type: 'error',
            });
          } finally {
            setDeleting(null);
          }
        }}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Telemetry;

