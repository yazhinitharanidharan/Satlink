import './FormField.css';

const FormField = ({ label, name, type = 'text', value, onChange, error, required, options, rows, ...props }) => {
  const id = `field-${name}`;
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {type === 'select' ? (
        <select id={id} name={name} value={value} onChange={onChange} {...props}>
          <option value="">Select {label}...</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea id={id} name={name} value={value} onChange={onChange} rows={rows || 3} {...props} />
      ) : (
        <input id={id} name={name} type={type} value={value} onChange={onChange} {...props} />
      )}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
};

export default FormField;
