import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const Antennas = () => {
  const { getAll } = useData();
  const stations = getAll('groundStations');

  const fields = [
    { name: 'ant_name', label: 'Antenna Name', required: true },
    { name: 'gs_id', label: 'Ground Station', type: 'select', required: true, options: () => stations.map(s => ({ value: s.gs_id, label: s.gs_name })), display: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'available', label: 'Available' },
      { value: 'in_use', label: 'In Use' },
      { value: 'maintenance', label: 'Maintenance' },
    ]},
    { name: 'frequency_range', label: 'Frequency Range', required: true, placeholder: 'e.g. 2-18 GHz' },
    { name: 'diameter_m', label: 'Diameter (m)', type: 'number', required: true, validate: (v) => v !== '' && Number(v) <= 0 ? 'Must be positive' : null },
  ];

  const columns = [
    { header: 'ID', accessor: 'ant_id', width: '70px' },
    { header: 'Antenna', accessor: 'ant_name' },
    { header: 'Ground Station', accessor: 'gs_id', render: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'available' ? 'success' : v === 'in_use' ? 'warning' : 'danger'}>{v.replace('_', ' ')}</Badge> },
    { header: 'Frequency', accessor: 'frequency_range' },
    { header: 'Diameter (m)', accessor: 'diameter_m' },
  ];

  return (
    <CrudPage
      title="Antennas"
      description="Antenna inventory, availability and ground station allocation."
      collection="antennas"
      idKey="ant_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'available' }}
      summaryStats={[
        { label: 'Total Antennas', value: (r) => r.length },
        { label: 'Available', value: (r) => r.filter(a => a.status === 'available').length },
        { label: 'In Use', value: (r) => r.filter(a => a.status === 'in_use').length },
        { label: 'Maintenance', value: (r) => r.filter(a => a.status === 'maintenance').length },
      ]}
      filters={[
        { key: 'status', accessor: 'status', label: 'Status', options: [
          { value: 'available', label: 'Available' },
          { value: 'in_use', label: 'In Use' },
          { value: 'maintenance', label: 'Maintenance' },
        ]},
        { key: 'station', accessor: 'gs_id', label: 'Station', options: stations.map(s => ({ value: s.gs_id, label: s.gs_name })) },
      ]}
    />
  );
};

export default Antennas;
