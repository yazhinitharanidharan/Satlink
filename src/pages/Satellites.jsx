import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const statusBadge = (val) => {
  const variants = { operational: 'success', maintenance: 'warning', standby: 'info', decommissioned: 'danger' };
  return <Badge variant={variants[val] || 'default'}>{val}</Badge>;
};

const Satellites = () => {
  const { getAll } = useData();
  const missions = getAll('missions');

  const fields = [
    { name: 'sat_name', label: 'Satellite Name', required: true },
    { name: 'norad_id', label: 'NORAD ID', required: true },
    { name: 'mission_id', label: 'Mission', type: 'select', required: true, options: () => missions.map(m => ({ value: m.mission_id, label: m.mission_name })), display: (v) => missions.find(m => m.mission_id === v)?.mission_name || '—' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'operational', label: 'Operational' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'standby', label: 'Standby' },
      { value: 'decommissioned', label: 'Decommissioned' },
    ]},
    { name: 'orbit_type', label: 'Orbit Type', type: 'select', required: true, options: () => [
      { value: 'LEO', label: 'LEO' },
      { value: 'MEO', label: 'MEO' },
      { value: 'GEO', label: 'GEO' },
      { value: 'SSO', label: 'SSO' },
      { value: 'HEO', label: 'HEO' },
    ]},
    { name: 'launch_date', label: 'Launch Date', type: 'date', required: true },
  ];

  const columns = [
    { header: 'ID', accessor: 'sat_id', width: '70px' },
    { header: 'Satellite', accessor: 'sat_name' },
    { header: 'Mission', accessor: 'mission_id', render: (v) => missions.find(m => m.mission_id === v)?.mission_name || '—' },
    { header: 'NORAD ID', accessor: 'norad_id' },
    { header: 'Orbit', accessor: 'orbit_type' },
    { header: 'Status', accessor: 'status', render: statusBadge },
    { header: 'Launch Date', accessor: 'launch_date' },
  ];

  return (
    <CrudPage
      title="Satellites"
      description="Spacecraft inventory, mission association and operational status."
      collection="satellites"
      idKey="sat_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'standby', orbit_type: 'LEO' }}
      summaryStats={[
        { label: 'Total Satellites', value: (r) => r.length },
        { label: 'Operational', value: (r) => r.filter(s => s.status === 'operational').length },
        { label: 'In Maintenance', value: (r) => r.filter(s => s.status === 'maintenance').length },
        { label: 'Standby', value: (r) => r.filter(s => s.status === 'standby').length },
      ]}
      filters={[
        { key: 'status', accessor: 'status', label: 'Status', options: [
          { value: 'operational', label: 'Operational' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'standby', label: 'Standby' },
        ]},
        { key: 'orbit', accessor: 'orbit_type', label: 'Orbit', options: [
          { value: 'LEO', label: 'LEO' },
          { value: 'GEO', label: 'GEO' },
          { value: 'SSO', label: 'SSO' },
        ]},
      ]}
    />
  );
};

export default Satellites;
