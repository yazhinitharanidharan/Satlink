import { useState } from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import DataTable from './DataTable';
import Modal from './Modal';
import FormField from './FormField';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import { useData } from '../../context/DataContext';
import './CrudPage.css';

const CrudPage = ({
  title,
  description,
  collection,
  idKey,
  onCreate,
  columns,
  fields,
  allowCreate = true,
  initialValues = {},
  summaryStats = [],
  filters = [],
  searchPlaceholder,
  onViewDetail,
  rowKey,
}) => {
  const { getAll, create, update, remove } = useData();
  const records = getAll(collection);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const openCreate = () => {
    setEditing(null);
    setFormValues(initialValues);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    const values = {};
    fields.forEach(f => { values[f.name] = record[f.name] ?? ''; });
    setFormValues(values);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach(f => {
      const required = f.required || (!editing && f.requiredOnCreate);
      if (required && (formValues[f.name] === '' || formValues[f.name] == null)) {
        newErrors[f.name] = `${f.label} is required`;
      }
      if (f.validate) {
        const msg = f.validate(formValues[f.name], formValues);
        if (msg) newErrors[f.name] = msg;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || saving) return;

    const processed = {};
    fields.forEach(f => {
      let val = formValues[f.name];

      if (editing && f.omitIfEmpty && (val === '' || val == null)) {
        return;
      }

      if (f.type === 'number') {
        val = val === '' || val == null ? null : Number(val);
      }

      processed[f.name] = val;
    });

    setSaving(true);

    try {
      if (editing) {
        await update(collection, idKey, editing[idKey], processed);
        showToast(`${title} record updated`);

      } else if (onCreate) {
        const result = await onCreate(processed);
        showToast(result?.message || `${title} request submitted`);
      } else {
        await create(collection, processed);
        showToast(`${title} record created`);
      }

      closeModal();
    } catch (error) {
      showToast(error?.message || `Unable to save ${title.toLowerCase()} record.`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deletingBusy) return;

    setDeletingBusy(true);

    try {
      await remove(collection, idKey, deleting[idKey]);
      showToast(`${title} record deleted`);
      setDeleting(null);
    } catch (error) {
      showToast(error?.message || `Unable to delete ${title.toLowerCase()} record.`, 'error');
    } finally {
      setDeletingBusy(false);
    }
  };

  const handleView = (row) => {
    if (onViewDetail) {
      onViewDetail(row);
    } else {
      setViewing(row);
    }
  };

  const tableColumns = [
    ...columns,
    {
      header: 'Actions',
      accessor: '__actions',
      sortable: false,
      render: (_, row) => (
        <div className="action-buttons">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={(e) => { e.stopPropagation(); handleView(row); }}
          >View</Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
          >Edit</Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={(e) => { e.stopPropagation(); setDeleting(row); }}
          >Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="crud-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
        {allowCreate && (<Button icon={Plus} onClick={openCreate}>Add {title.replace(/s$/, '')}</Button>)}
      </div>

      {summaryStats.length > 0 && (
        <div className="stats-grid">
          {summaryStats.map((stat, i) => (
            <Card className="stat-card" key={i}>
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-value">{stat.value(records)}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <DataTable
          columns={tableColumns}
          data={records}
          filters={filters}
          searchPlaceholder={searchPlaceholder || `Search ${title.toLowerCase()}...`}
          emptyMessage={`No ${title.toLowerCase()} found. Add your first record.`}
          rowKey={rowKey || ((row) => row[idKey])}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {fields.map(field => (
              <div key={field.name} className={field.fullWidth ? 'full-width' : ''}>
                <FormField
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={formValues[field.name] ?? ''}
                  onChange={handleChange}
                  error={errors[field.name]}
                  required={field.required || (!editing && field.requiredOnCreate)}
                  options={field.options ? field.options(records) : undefined}
                  placeholder={field.placeholder}
                  rows={field.rows}
                />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <Button variant="secondary" type="button" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title={`${title.replace(/s$/, '')} Details`}
        size="md"
      >
        {viewing && (
          <div className="detail-list">
            {fields.map(field => (
              <div className="detail-row" key={field.name}>
                <span className="detail-label">{field.label}</span>
                <span className="detail-value">
                  {field.display
                    ? field.display(viewing[field.name], viewing)
                    : (viewing[field.name] ?? '—')}
                </span>
              </div>
            ))}
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>
              <Button variant="primary" icon={Edit} onClick={() => { const r = viewing; setViewing(null); openEdit(r); }}>Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete ${title.replace(/s$/, '')}`}
        message={`Are you sure you want to delete this record? This action cannot be undone.`}
        confirmText={deletingBusy ? 'Deleting...' : 'Delete'}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CrudPage;
