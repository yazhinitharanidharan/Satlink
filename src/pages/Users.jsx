import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';

const Users = () => {
  const fields = [
    { name: 'username', label: 'Username', required: true, validate: (v) => v && v.length < 3 ? 'At least 3 characters' : null },
    { name: 'full_name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true, validate: (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : null },
    { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true, omitIfEmpty: true, fullWidth: true, placeholder: 'Leave blank to keep the current password', display: () => '••••••••', validate: (v) => v && v.length < 8 ? 'At least 8 characters' : null },
    { name: 'role', label: 'Role', type: 'select', required: true, options: () => [
      { value: 'Administrator', label: 'Administrator' },
      { value: 'Operator', label: 'Operator' },
      { value: 'Engineer', label: 'Engineer' },
      { value: 'Viewer', label: 'Viewer' },
    ]},
    { name: 'status', label: 'Status', type: 'select', required: true, options: () => [
      { value: 'active', label: 'Active' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'inactive', label: 'Inactive' },
    ]},
  ];

  const columns = [
    { header: 'ID', accessor: 'user_id', width: '70px' },
    { header: 'Username', accessor: 'username' },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', render: (v) => <Badge variant={v === 'Administrator' ? 'danger' : v === 'Operator' ? 'warning' : 'info'}>{v}</Badge> },
    { header: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'}>{v}</Badge> },
  ];

  return (
    <CrudPage
      title="Users"
      description="User directory and administrative roles. Passwords are hashed by the backend and never returned to the browser."
      collection="users"
      idKey="user_id"
      columns={columns}
      fields={fields}
      initialValues={{ status: 'active', role: 'Viewer' }}
      summaryStats={[
        { label: 'Total Users', value: (r) => r.length },
        { label: 'Administrators', value: (r) => r.filter(u => u.role === 'Administrator').length },
        { label: 'Active', value: (r) => r.filter(u => u.status === 'active').length },
      ]}
      filters={[
        { key: 'role', accessor: 'role', label: 'Role', options: [
          { value: 'Administrator', label: 'Administrator' },
          { value: 'Operator', label: 'Operator' },
          { value: 'Engineer', label: 'Engineer' },
          { value: 'Viewer', label: 'Viewer' },
        ]},
      ]}
    />
  );
};

export default Users;
