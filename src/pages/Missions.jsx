import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const statusBadge = (val) => {
  const variants = { active: 'success', planning: 'info', completed: 'default', cancelled: 'danger' };
  return <Badge variant={variants[val] || 'default'}>{val}</Badge>;
};

const Missions = () => {
  const { getAll } = useData();
  const satellites = getAll('satellites');

  const fields = [
    { name: 'mission_name', label: 'Mission Name', required: true, fullWidth: true, validate: (v) => v && v.length < 3 ? 'Must be at least 3 characters' : null },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'planning', label: 'Planning' },
      { value: 'active', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
    { name: 'lead_engineer', label: 'Lead Engineer', required: true },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: true, validate: (v, vals) => v && vals.start_date && v < vals.start_date ? 'End date must be after start date' : null },
  ];

  const columns = [
    { header: 'ID', accessor: 'mission_id', width: '70px' },
    { header: 'Mission Name', accessor: 'mission_name' },
    { header: 'Status', accessor: 'status', render: statusBadge },
    { header: 'Start Date', accessor: 'start_date' },
    { header: 'End Date', accessor: 'end_date' },
    { header: 'Lead Engineer', accessor: 'lead_engineer' },
    { header: 'Satellites', accessor: 'satellites', sortable: false, render: (_, row) => satellites.filter(s => s.mission_id === row.mission_id).length },
  ];

  return (
    <CrudPage
      title="Missions"
      description="Manage satellite missions, timelines and ownership."
      collection="missions"
      idKey="mission_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'planning' }}
      summaryStats={[
        { label: 'Total Missions', value: (r) => r.length },
        { label: 'Active', value: (r) => r.filter(m => m.status === 'active').length },
        { label: 'Planning', value: (r) => r.filter(m => m.status === 'planning').length },
        { label: 'Completed', value: (r) => r.filter(m => m.status === 'completed').length },
      ]}
      filters={[{ key: 'status', accessor: 'status', label: 'Status', options: [
        { value: 'active', label: 'Active' },
        { value: 'planning', label: 'Planning' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ]}]}
    />
  );
};

export default Missions;
