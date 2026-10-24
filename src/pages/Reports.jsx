import { Download } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { missions, satellites, groundStations, communicationSessions, engineers } from '../data/mockData';
import './Reports.css';

const Reports = () => {
  const missionReportColumns = [
    { header: 'Mission', accessor: 'mission_name' },
    { header: 'Status', accessor: 'status' },
    { header: 'Satellites', accessor: 'count', render: (_, row) => satellites.filter(s => s.mission_id === row.mission_id).length },
    { header: 'Start Date', accessor: 'start_date' },
  ];

  const stationReportColumns = [
    { header: 'Ground Station', accessor: 'gs_name' },
    { header: 'Location', accessor: 'location' },
    { header: 'Status', accessor: 'status' },
    { header: 'Sessions', accessor: 'count', render: (_, row) => communicationSessions.filter(s => s.gs_id === row.gs_id).length },
  ];

  const exportCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analytical reports and data exports • Demo data</p>
        </div>
      </div>

      <div className="reports-grid">
        <Card title="Mission Status Report" subtitle="Mission overview" action={<Button size="sm" icon={Download} onClick={() => exportCSV(missions, 'missions-report.csv')}>Export CSV</Button>}>
          <Table columns={missionReportColumns} data={missions} />
        </Card>

        <Card title="Ground Station Utilization" subtitle="Station activity report" action={<Button size="sm" icon={Download} onClick={() => exportCSV(groundStations, 'stations-report.csv')}>Export CSV</Button>}>
          <Table columns={stationReportColumns} data={groundStations} />
        </Card>

        <Card title="Communication Sessions History" subtitle="Session statistics" action={<Button size="sm" icon={Download} onClick={() => exportCSV(communicationSessions, 'sessions-report.csv')}>Export CSV</Button>}>
          <Table columns={[
            { header: 'Session ID', accessor: 'session_id' },
            { header: 'Status', accessor: 'status' },
            { header: 'Start Time', accessor: 'start_time', render: (val) => new Date(val).toLocaleDateString() },
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
