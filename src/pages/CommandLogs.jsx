import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const CommandLogs = () => {
  const { getAll } = useData();
  const satellites = getAll('satellites');
  const sessions = getAll('communicationSessions');
  const engineers = getAll('engineers');
  const fmt = (v) => v ? new Date(v).toLocaleString() : '—';

  const fields = [
    { name: 'session_id', label: 'Session', type: 'select', required: true, options: () => sessions.map(s => ({ value: s.session_id, label: `#${s.session_id}` })), display: (v) => v ? `#${v}` : '—' },
    { name: 'command_type', label: 'Command Type', required: true, placeholder: 'e.g. PAYLOAD_CONFIG' },
    { name: 'sent_by', label: 'Sent By', type: 'select', required: true, options: () => engineers.map(e => ({ value: e.eng_id, label: e.eng_name })), display: (v) => engineers.find(e => e.eng_id === v)?.eng_name || '—' },
    { name: 'timestamp', label: 'Timestamp', type: 'datetime-local', required: true, display: fmt },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'pending', label: 'Pending' },
      { value: 'executed', label: 'Executed' },
      { value: 'failed', label: 'Failed' },
    ]},
    { name: 'details', label: 'Details', type: 'textarea', fullWidth: true },
  ];

  const columns = [
    { header: 'ID', accessor: 'cmd_id', width: '70px' },
    { header: 'Session', accessor: 'session_id' },
    { header: 'Satellite', accessor: 'sat_id', render: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { header: 'Command', accessor: 'command_type', render: (v) => <Badge variant="info">{v}</Badge> },
    { header: 'Timestamp', accessor: 'timestamp', render: fmt },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'executed' ? 'success' : v === 'failed' ? 'danger' : 'warning'}>{v}</Badge> },
    { header: 'Sent By', accessor: 'sent_by', render: (v) => engineers.find(e => e.eng_id === v)?.eng_name || '—' },
  ];

  return (
    <CrudPage
      title="Command Logs"
      description="Recorded command history. This is an academic management interface — no commands are transmitted to real spacecraft."
      collection="commandLogs"
      idKey="cmd_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'pending' }}
      summaryStats={[
        { label: 'Total Commands', value: (r) => r.length },
        { label: 'Executed', value: (r) => r.filter(c => c.status === 'executed').length },
        { label: 'Pending', value: (r) => r.filter(c => c.status === 'pending').length },
        { label: 'Failed', value: (r) => r.filter(c => c.status === 'failed').length },
      ]}
      filters={[
        { key: 'status', accessor: 'status', label: 'Status', options: [
          { value: 'executed', label: 'Executed' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
        ]},
        { key: 'sat', accessor: 'sat_id', label: 'Satellite', options: satellites.map(s => ({ value: s.sat_id, label: s.sat_name })) },
      ]}
    />
  );
};

export default CommandLogs;
