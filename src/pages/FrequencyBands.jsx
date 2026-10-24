import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const FrequencyBands = () => {
  const { getAll } = useData();
  const sessions = getAll('communicationSessions');

  const fields = [
    { name: 'band_name', label: 'Band Name', required: true, placeholder: 'e.g. X-Band' },
    { name: 'frequency_range', label: 'Frequency Range', required: true, placeholder: 'e.g. 8.0-12.0 GHz' },
    { name: 'description', label: 'Supported Use', type: 'textarea', fullWidth: true, required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'available', label: 'Available' },
      { value: 'restricted', label: 'Restricted' },
      { value: 'retired', label: 'Retired' },
    ]},
  ];

  const columns = [
    { header: 'ID', accessor: 'band_id', width: '70px' },
    { header: 'Band Name', accessor: 'band_name' },
    { header: 'Frequency Range', accessor: 'frequency_range' },
    { header: 'Supported Use', accessor: 'description' },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'available' ? 'success' : v === 'restricted' ? 'warning' : 'default'}>{v || 'available'}</Badge> },
    { header: 'Sessions', accessor: 'sessions', sortable: false, render: (_, row) => sessions.filter(s => s.band_id === row.band_id).length },
  ];

  return (
    <CrudPage
      title="Frequency Bands"
      description="Manage RF frequency allocations, ranges and supported uses."
      collection="frequencyBands"
      idKey="band_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'available' }}
      summaryStats={[
        { label: 'Total Bands', value: (r) => r.length },
        { label: 'Available', value: (r) => r.filter(b => (b.status || 'available') === 'available').length },
        { label: 'Restricted', value: (r) => r.filter(b => b.status === 'restricted').length },
        { label: 'Sessions Using Bands', value: () => sessions.length },
      ]}
      filters={[{ key: 'status', accessor: 'status', label: 'Status', options: [
        { value: 'available', label: 'Available' },
        { value: 'restricted', label: 'Restricted' },
        { value: 'retired', label: 'Retired' },
      ]}]}
    />
  );
};

export default FrequencyBands;
