import CrudPage from '../components/common/CrudPage';
import Badge from '../components/common/Badge';
import { useData } from '../context/DataContext';

const Weather = () => {
  const { getAll } = useData();
  const stations = getAll('groundStations');
  const fmt = (v) => v ? new Date(v).toLocaleString() : '—';

  const fields = [
    { name: 'gs_id', label: 'Ground Station', type: 'select', required: true, options: () => stations.map(s => ({ value: s.gs_id, label: s.gs_name })), display: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { name: 'observation_time', label: 'Observation Time', type: 'datetime-local', required: true, display: fmt },
    { name: 'temperature_c', label: 'Temperature (°C)', type: 'number', required: true },
    { name: 'humidity_percent', label: 'Humidity (%)', type: 'number', required: true, validate: (v) => v !== '' && (Number(v) < 0 || Number(v) > 100) ? 'Must be 0–100' : null },
    { name: 'wind_speed_kmh', label: 'Wind Speed (km/h)', type: 'number', required: true },
    { name: 'precipitation_mm', label: 'Precipitation (mm)', type: 'number', required: true },
    { name: 'cloud_cover_percent', label: 'Cloud Cover (%)', type: 'number', required: true, validate: (v) => v !== '' && (Number(v) < 0 || Number(v) > 100) ? 'Must be 0–100' : null },
    { name: 'conditions', label: 'Conditions', type: 'select', required: true, options: () => [
      { value: 'Clear', label: 'Clear' },
      { value: 'Partly Cloudy', label: 'Partly Cloudy' },
      { value: 'Cloudy', label: 'Cloudy' },
      { value: 'Light Rain', label: 'Light Rain' },
      { value: 'Heavy Rain', label: 'Heavy Rain' },
      { value: 'Storm', label: 'Storm' },
    ]},
  ];

  const columns = [
    { header: 'ID', accessor: 'weather_id', width: '70px' },
    { header: 'Station', accessor: 'gs_id', render: (v) => stations.find(s => s.gs_id === v)?.gs_name || '—' },
    { header: 'Observed', accessor: 'observation_time', render: fmt },
    { header: 'Temp', accessor: 'temperature_c', render: (v) => `${v} °C` },
    { header: 'Humidity', accessor: 'humidity_percent', render: (v) => `${v}%` },
    { header: 'Wind', accessor: 'wind_speed_kmh', render: (v) => `${v} km/h` },
    { header: 'Conditions', accessor: 'conditions', render: (v) => <Badge variant={v === 'Clear' ? 'success' : v === 'Light Rain' || v === 'Partly Cloudy' ? 'warning' : 'danger'}>{v}</Badge> },
  ];

  return (
    <CrudPage
      title="Weather Records"
      description="Ground station weather observations recorded in SATLINK."
      collection="weatherRecords"
      idKey="weather_id"
      columns={columns}
      fields={fields}
      initialValues={{ conditions: 'Clear' }}
      summaryStats={[
        { label: 'Total Records', value: (r) => r.length },
        { label: 'Stations Reporting', value: (r) => new Set(r.map(w => w.gs_id)).size },
        { label: 'Adverse Conditions', value: (r) => r.filter(w => ['Heavy Rain', 'Storm'].includes(w.conditions)).length },
      ]}
      filters={[
        { key: 'station', accessor: 'gs_id', label: 'Station', options: stations.map(s => ({ value: s.gs_id, label: s.gs_name })) },
        { key: 'conditions', accessor: 'conditions', label: 'Conditions', options: [
          { value: 'Clear', label: 'Clear' },
          { value: 'Partly Cloudy', label: 'Partly Cloudy' },
          { value: 'Light Rain', label: 'Light Rain' },
          { value: 'Heavy Rain', label: 'Heavy Rain' },
          { value: 'Storm', label: 'Storm' },
        ]},
      ]}
    />
  );
};

export default Weather;
