import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const Engineers = () => {
  const { getAll } = useData();
  const assignments = getAll('engineerAssignments');

  const fields = [
    { name: 'eng_name', label: 'Full Name', required: true },
    { name: 'role', label: 'Role', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true, validate: (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : null },
    { name: 'specialization', label: 'Specialization', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'active', label: 'Active' },
      { value: 'on_call', label: 'On Call' },
      { value: 'inactive', label: 'Inactive' },
    ]},
  ];

  const columns = [
    { header: 'ID', accessor: 'eng_id', width: '70px' },
    { header: 'Name', accessor: 'eng_name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Email', accessor: 'email' },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'active' ? 'success' : v === 'on_call' ? 'warning' : 'default'}>{(v || 'unknown').replace('_', ' ')}</Badge> },
    { header: 'Assignments', accessor: 'assignments', sortable: false, render: (_, row) => assignments.filter(a => a.eng_id === row.eng_id).length },
  ];

  return (
    <CrudPage
      title="Engineers"
      description="Operations team directory, roles, contact details and session assignments."
      collection="engineers"
      idKey="eng_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'active' }}
      summaryStats={[
        { label: 'Total Engineers', value: (r) => r.length },
        { label: 'Active', value: (r) => r.filter(e => e.status === 'active').length },
        { label: 'On Call', value: (r) => r.filter(e => e.status === 'on_call').length },
        { label: 'Assignments', value: () => assignments.length },
      ]}
      filters={[{ key: 'status', accessor: 'status', label: 'Status', options: [
        { value: 'active', label: 'Active' },
        { value: 'on_call', label: 'On Call' },
        { value: 'inactive', label: 'Inactive' },
      ]}]}
    />
  );
};

export default Engineers;
