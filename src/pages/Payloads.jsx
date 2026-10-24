import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const Payloads = () => {
  const { getAll } = useData();
  const satellites = getAll('satellites');

  const fields = [
    { name: 'payload_name', label: 'Payload Name', required: true },
    { name: 'sat_id', label: 'Satellite', type: 'select', required: true, options: () => satellites.map(s => ({ value: s.sat_id, label: s.sat_name })), display: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { name: 'payload_type', label: 'Payload Type', type: 'select', required: true, options: () => [
      { value: 'Transponder', label: 'Transponder' },
      { value: 'Imager', label: 'Imager' },
      { value: 'Relay', label: 'Relay' },
      { value: 'Sensor', label: 'Sensor' },
    ]},
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'fault', label: 'Fault' },
    ]},
    { name: 'mass_kg', label: 'Mass (kg)', type: 'number', required: true, validate: (v) => v !== '' && Number(v) <= 0 ? 'Mass must be positive' : null },
  ];

  const columns = [
    { header: 'ID', accessor: 'payload_id', width: '70px' },
    { header: 'Payload', accessor: 'payload_name' },
    { header: 'Satellite', accessor: 'sat_id', render: (v) => satellites.find(s => s.sat_id === v)?.sat_name || '—' },
    { header: 'Type', accessor: 'payload_type' },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'active' ? 'success' : v === 'fault' ? 'danger' : 'default'}>{v}</Badge> },
    { header: 'Mass (kg)', accessor: 'mass_kg' },
  ];

  return (
    <CrudPage
      title="Payloads"
      description="Satellite payload inventory, type and technical attributes."
      collection="payloads"
      idKey="payload_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'active', payload_type: 'Transponder' }}
      summaryStats={[
        { label: 'Total Payloads', value: (r) => r.length },
        { label: 'Active', value: (r) => r.filter(p => p.status === 'active').length },
        { label: 'Total Mass (kg)', value: (r) => r.reduce((sum, p) => sum + (Number(p.mass_kg) || 0), 0).toFixed(1) },
      ]}
      filters={[{ key: 'type', accessor: 'payload_type', label: 'Type', options: [
        { value: 'Transponder', label: 'Transponder' },
        { value: 'Imager', label: 'Imager' },
        { value: 'Relay', label: 'Relay' },
        { value: 'Sensor', label: 'Sensor' },
      ]}]}
    />
  );
};

export default Payloads;
