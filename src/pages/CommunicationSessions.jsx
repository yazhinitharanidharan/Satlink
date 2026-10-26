import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const CommunicationSessions = () => {
  const { getAll } = useData();
  const satellites = getAll('satellites');
  const stations = getAll('groundStations');
  const antennas = getAll('antennas');
  const bands = getAll('frequencyBands');
  const windows = getAll('communicationWindows');
  const fmt = (v) => v ? new Date(v).toLocaleString() : '—';

  const fields = [
    { name: 'window_id', label: 'Communication Window', type: 'select', required: true, options: () => windows.map(w => ({ value: w.window_id, label: `#${w.window_id} (${w.status})` })), display: (v) => v ? `#${v}` : '—' },
    { name: 'sat_id', label: 'Satellite', type: 'select', required: true, options: () => satellites.map(s => ({ value: s.sat_id, label: s.sat_name })), display: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { name: 'gs_id', label: 'Ground Station', type: 'select', required: true, options: () => stations.map(s => ({ value: s.gs_id, label: s.gs_name })), display: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { name: 'ant_id', label: 'Antenna', type: 'select', required: true, options: () => antennas.map(a => ({ value: a.ant_id, label: a.ant_name })), display: (v) => antennas.find(a => a.ant_id === v)?.ant_name || '—' },
    { name: 'band_id', label: 'Frequency Band', type: 'select', required: true, options: () => bands.map(b => ({ value: b.band_id, label: b.band_name })), display: (v) => bands.find(b => b.band_id === v)?.band_name || '—' },
    { name: 'start_time', label: 'Start Time', type: 'datetime-local', required: true, display: fmt },
    { name: 'end_time', label: 'End Time', type: 'datetime-local', required: true, display: fmt, validate: (v, vals) => v && vals.start_time && new Date(v) <= new Date(vals.start_time) ? 'End must be after start' : null },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
    { name: 'operator', label: 'Operator', required: true },
  ];

  const columns = [
    { header: 'Session ID', accessor: 'session_id' },
    { header: 'Satellite', accessor: 'sat_id', render: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { header: 'Station', accessor: 'gs_id', render: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { header: 'Antenna', accessor: 'ant_id', render: (v) => antennas.find(a => a.ant_id === v)?.ant_name || '—' },
    { header: 'Band', accessor: 'band_id', render: (v) => bands.find(b => b.band_id === v)?.band_name || '—' },
    { header: 'Start', accessor: 'start_time', render: fmt },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'completed' ? 'success' : v === 'in_progress' ? 'warning' : v === 'cancelled' ? 'danger' : 'info'}>{(v || 'scheduled').replace('_', ' ')}</Badge> },
  ];

  return (
    <CrudPage
      title="Communication Sessions"
      description="Scheduled and historical communication sessions linking satellites, stations, antennas and bands. Session numbers are assigned by the database."
      collection="communicationSessions"
      idKey="session_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'scheduled' }}
      summaryStats={[
        { label: 'Total Sessions', value: (r) => r.length },
        { label: 'Scheduled', value: (r) => r.filter(s => s.status === 'scheduled').length },
        { label: 'In Progress', value: (r) => r.filter(s => s.status === 'in_progress').length },
        { label: 'Completed', value: (r) => r.filter(s => s.status === 'completed').length },
      ]}
      filters={[
        { key: 'status', accessor: 'status', label: 'Status', options: [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]},
        { key: 'sat', accessor: 'sat_id', label: 'Satellite', options: satellites.map(s => ({ value: s.sat_id, label: s.sat_name })) },
      ]}
    />
  );
};

export default CommunicationSessions;
