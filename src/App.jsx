import { Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import Satellites from './pages/Satellites';
import Payloads from './pages/Payloads';
import GroundStations from './pages/GroundStations';
import Antennas from './pages/Antennas';
import CommunicationWindows from './pages/CommunicationWindows';
import Scheduling from './pages/Scheduling';
import CommunicationSessions from './pages/CommunicationSessions';
import Engineers from './pages/Engineers';
import Maintenance from './pages/Maintenance';
import Weather from './pages/Weather';
import FrequencyBands from './pages/FrequencyBands';
import Telemetry from './pages/Telemetry';
import CommandLogs from './pages/CommandLogs';
import SchedulingRecommendations from './pages/SchedulingRecommendations';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

function App() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <div className="auth-loading">Restoring session...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <DataProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/satellites" element={<Satellites />} />
          <Route path="/payloads" element={<Payloads />} />
          <Route path="/ground-stations" element={<GroundStations />} />
          <Route path="/antennas" element={<Antennas />} />
          <Route path="/communication-windows" element={<CommunicationWindows />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/communication-sessions" element={<CommunicationSessions />} />
          <Route path="/engineers" element={<Engineers />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/frequency-bands" element={<FrequencyBands />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/command-logs" element={<CommandLogs />} />
          <Route path="/scheduling-recommendations" element={<SchedulingRecommendations />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </DataProvider>
  );
}

export default App;
