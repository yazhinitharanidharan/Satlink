import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const CommunicationWindows = () => {
  const { getAll } = useData();
  const satellites = getAll('satellites');
  const stations = getAll('groundStations');

  const fmt = (v) => v ? new Date(v).toLocaleString() : '—';

  const fields = [
    { name: 'sat_id', label: 'Satellite', type: 'select', required: true, options: () => satellites.map(s => ({ value: s.sat_id, label: s.sat_name })), display: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { name: 'gs_id', label: 'Ground Station', type: 'select', required: true, options: () => stations.map(s => ({ value: s.gs_id, label: s.gs_name })), display: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { name: 'start_time', label: 'Start Time', type: 'datetime-local', required: true, display: fmt },
    { name: 'end_time', label: 'End Time', type: 'datetime-local', required: true, display: fmt, validate: (v, vals) => v && vals.start_time && new Date(v) <= new Date(vals.start_time) ? 'End must be after start' : null },
    { name: 'azimuth', label: 'Azimuth (°)', type: 'number', required: true, validate: (v) => v !== '' && (Number(v) < 0 || Number(v) > 360) ? 'Must be 0–360' : null },
    { name: 'elevation', label: 'Elevation (°)', type: 'number', required: true, validate: (v) => v !== '' && (Number(v) < 0 || Number(v) > 90) ? 'Must be 0–90' : null },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'predicted', label: 'Predicted' },
      { value: 'registered', label: 'Registered' },
      { value: 'expired', label: 'Expired' },
    ]},
  ];

  const columns = [
    { header: 'ID', accessor: 'window_id', width: '80px' },
    { header: 'Satellite', accessor: 'sat_id', render: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { header: 'Ground Station', accessor: 'gs_id', render: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { header: 'Start', accessor: 'start_time', render: fmt },
    { header: 'End', accessor: 'end_time', render: fmt },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'registered' ? 'success' : v === 'expired' ? 'default' : 'info'}>{v}</Badge> },
  ];

  return (
    <CrudPage
      title="Communication Windows"
      description="Predicted and registered satellite communication opportunities. Windows are imported/predicted, not live orbital calculations."
      collection="communicationWindows"
      idKey="window_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'predicted' }}
      summaryStats={[
        { label: 'Total Windows', value: (r) => r.length },
        { label: 'Predicted', value: (r) => r.filter(w => w.status === 'predicted').length },
        { label: 'Registered', value: (r) => r.filter(w => w.status === 'registered').length },
      ]}
      filters={[
        { key: 'status', accessor: 'status', label: 'Status', options: [
          { value: 'predicted', label: 'Predicted' },
          { value: 'registered', label: 'Registered' },
          { value: 'expired', label: 'Expired' },
        ]},
        { key: 'sat', accessor: 'sat_id', label: 'Satellite', options: satellites.map(s => ({ value: s.sat_id, label: s.sat_name })) },
      ]}
    />
  );
};

export default CommunicationWindows;
