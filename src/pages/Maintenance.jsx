import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const Maintenance = () => {
  const { getAll } = useData();
  const antennas = getAll('antennas');
  const stations = getAll('groundStations');
  const engineers = getAll('engineers');
  const fmt = (v) => v ? new Date(v).toLocaleString() : '—';

  const fields = [
    { name: 'ant_id', label: 'Antenna', type: 'select', required: true, options: () => antennas.map(a => ({ value: a.ant_id, label: a.ant_name })), display: (v) => antennas.find(a => a.ant_id === v)?.ant_name || '—' },
    { name: 'gs_id', label: 'Ground Station', type: 'select', required: true, options: () => stations.map(s => ({ value: s.gs_id, label: s.gs_name })), display: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { name: 'maint_type', label: 'Maintenance Type', type: 'select', required: true, options: () => [
      { value: 'Preventive', label: 'Preventive' },
      { value: 'Corrective', label: 'Corrective' },
      { value: 'Emergency', label: 'Emergency' },
    ]},
    { name: 'eng_id', label: 'Responsible Engineer', type: 'select', required: true, options: () => engineers.map(e => ({ value: e.eng_id, label: e.eng_name })), display: (v) => engineers.find(e => e.eng_id === v)?.eng_name || '—' },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, required: true },
    { name: 'start_date', label: 'Start', type: 'datetime-local', required: true, display: fmt },
    { name: 'end_date', label: 'End', type: 'datetime-local', required: true, display: fmt, validate: (v, vals) => v && vals.start_date && new Date(v) <= new Date(vals.start_date) ? 'End must be after start' : null },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
  ];

  const columns = [
    { header: 'ID', accessor: 'maint_id', width: '70px' },
    { header: 'Antenna', accessor: 'ant_id', render: (v) => antennas.find(a => a.ant_id === v)?.ant_name || '—' },
    { header: 'Station', accessor: 'gs_id', render: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { header: 'Type', accessor: 'maint_type', render: (v) => <Badge variant="info">{v}</Badge> },
    { header: 'Start', accessor: 'start_date', render: fmt },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'completed' ? 'success' : v === 'scheduled' ? 'warning' : v === 'cancelled' ? 'danger' : 'info'}>{(v || 'scheduled').replace('_', ' ')}</Badge> },
    { header: 'Engineer', accessor: 'eng_id', render: (v) => engineers.find(e => e.eng_id === v)?.eng_name || '—' },
  ];

  return (
    <CrudPage
      title="Maintenance"
      description="Maintenance logs and outage windows for antennas and ground stations."
      collection="maintenanceLogs"
      idKey="maint_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'scheduled', maint_type: 'Preventive' }}
      summaryStats={[
        { label: 'Total Records', value: (r) => r.length },
        { label: 'Scheduled', value: (r) => r.filter(m => m.status === 'scheduled').length },
        { label: 'In Progress', value: (r) => r.filter(m => m.status === 'in_progress').length },
        { label: 'Completed', value: (r) => r.filter(m => m.status === 'completed').length },
      ]}
      filters={[
        { key: 'status', accessor: 'status', label: 'Status', options: [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
        ]},
        { key: 'type', accessor: 'maint_type', label: 'Type', options: [
          { value: 'Preventive', label: 'Preventive' },
          { value: 'Corrective', label: 'Corrective' },
          { value: 'Emergency', label: 'Emergency' },
        ]},
      ]}
    />
  );
};

export default Maintenance;
