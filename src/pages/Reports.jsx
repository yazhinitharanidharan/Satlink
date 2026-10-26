import { Download } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { useData } from '../context/DataContext';
import './Reports.css';

const escapeCsvValue = (value) => {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const Reports = () => {
  const { getAll } = useData();
  const missions = getAll('missions');
  const satellites = getAll('satellites');
  const groundStations = getAll('groundStations');
  const communicationSessions = getAll('communicationSessions');
  const engineers = getAll('engineers');

  const missionRows = missions.map((mission) => ({
    ...mission,
    satellite_count: satellites.filter(s => s.mission_id === mission.mission_id).length,
  }));

  const stationRows = groundStations.map((station) => ({
    ...station,
    session_count: communicationSessions.filter(s => s.gs_id === station.gs_id).length,
  }));

  const missionReportColumns = [
    { header: 'Mission', accessor: 'mission_name' },
    { header: 'Status', accessor: 'status' },
    { header: 'Satellites', accessor: 'satellite_count' },
    { header: 'Start Date', accessor: 'start_date', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  ];

  const stationReportColumns = [
    { header: 'Ground Station', accessor: 'gs_name' },
    { header: 'Location', accessor: 'location' },
    { header: 'Status', accessor: 'status' },
    { header: 'Sessions', accessor: 'session_count' },
  ];

  const exportCSV = (data, filename) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...data.map(row => headers.map(header => escapeCsvValue(row[header])).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analytical reports and data exports from SATLINK</p>
        </div>
      </div>

      <div className="reports-grid">
        <Card title="Mission Status Report" subtitle="Mission overview" action={<Button size="sm" icon={Download} onClick={() => exportCSV(missionRows, 'missions-report.csv')}>Export CSV</Button>}>
          <Table columns={missionReportColumns} data={missionRows} />
        </Card>

        <Card title="Ground Station Utilization" subtitle="Station activity report" action={<Button size="sm" icon={Download} onClick={() => exportCSV(stationRows, 'stations-report.csv')}>Export CSV</Button>}>
          <Table columns={stationReportColumns} data={stationRows} />
        </Card>

        <Card title="Communication Sessions History" subtitle="Session statistics" action={<Button size="sm" icon={Download} onClick={() => exportCSV(communicationSessions, 'sessions-report.csv')}>Export CSV</Button>}>
          <Table columns={[
            { header: 'Session ID', accessor: 'session_id' },
            { header: 'Status', accessor: 'status' },
            { header: 'Start Time', accessor: 'start_time', render: (val) => val ? new Date(val).toLocaleString() : '—' },
            { header: 'Operator', accessor: 'operator' },
          ]} data={communicationSessions} />
        </Card>

        <Card title="Engineer Assignment Report" subtitle="Resource allocation" action={<Button size="sm" icon={Download} onClick={() => exportCSV(engineers, 'engineers-report.csv')}>Export CSV</Button>}>
          <Table columns={[
            { header: 'Engineer', accessor: 'eng_name' },
            { header: 'Role', accessor: 'role' },
            { header: 'Specialization', accessor: 'specialization' },
            { header: 'Status', accessor: 'status' },
          ]} data={engineers} />
        </Card>
      </div>
    </div>
  );
};

export default Reports;
