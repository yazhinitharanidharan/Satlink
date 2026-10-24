import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const GroundStations = () => {
  const { getAll } = useData();
  const antennas = getAll('antennas');

  const fields = [
    { name: 'gs_name', label: 'Station Name', required: true, fullWidth: true },
    { name: 'location', label: 'Location', required: true, fullWidth: true },
    { name: 'latitude', label: 'Latitude', type: 'number', required: true, validate: (v) => v !== '' && (Number(v) < -90 || Number(v) > 90) ? 'Must be between -90 and 90' : null },
    { name: 'longitude', label: 'Longitude', type: 'number', required: true, validate: (v) => v !== '' && (Number(v) < -180 || Number(v) > 180) ? 'Must be between -180 and 180' : null },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'operational', label: 'Operational' },
      { value: 'degraded', label: 'Degraded' },
      { value: 'offline', label: 'Offline' },
    ]},
    { name: 'elevation_m', label: 'Elevation (m)', type: 'number', required: true },
  ];

  const columns = [
    { header: 'ID', accessor: 'gs_id', width: '70px' },
    { header: 'Station Name', accessor: 'gs_name' },
    { header: 'Location', accessor: 'location' },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'operational' ? 'success' : v === 'degraded' ? 'warning' : 'danger'}>{v}</Badge> },
    { header: 'Elevation (m)', accessor: 'elevation_m' },
    { header: 'Antennas', accessor: 'antennas', sortable: false, render: (_, row) => antennas.filter(a => a.gs_id === row.gs_id).length },
  ];

  return (
    <CrudPage
      title="Ground Stations"
      description="Ground station infrastructure, coordinates and operational status."
      collection="groundStations"
      idKey="gs_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'operational' }}
      summaryStats={[
        { label: 'Total Stations', value: (r) => r.length },
        { label: 'Operational', value: (r) => r.filter(s => s.status === 'operational').length },
        { label: 'Total Antennas', value: () => antennas.length },
      ]}
      filters={[{ key: 'status', accessor: 'status', label: 'Status', options: [
        { value: 'operational', label: 'Operational' },
        { value: 'degraded', label: 'Degraded' },
        { value: 'offline', label: 'Offline' },
      ]}]}
    />
  );
};

export default GroundStations;
