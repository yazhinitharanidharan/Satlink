import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Rocket,
  Satellite,
  Package,
  Radio,
  Antenna,
  Clock,
  Calendar,
  CheckCircle,
  Activity,
  Users,
  Wrench,
  Cloud,
  RadioTower,
  BarChart3,
  Terminal,
  Bell,
  FileText,
  UserCog,
  ChevronLeft,
  ChevronRight,
  SatelliteDish
} from 'lucide-react';
import './Sidebar.css';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    title: 'Space Assets',
    items: [
      { path: '/missions', icon: Rocket, label: 'Missions' },
      { path: '/satellites', icon: Satellite, label: 'Satellites' },
      { path: '/payloads', icon: Package, label: 'Payloads' },
    ]
  },
  {
    title: 'Ground Infrastructure',
    items: [
      { path: '/ground-stations', icon: Radio, label: 'Ground Stations' },
      { path: '/antennas', icon: Antenna, label: 'Antennas' },
      { path: '/frequency-bands', icon: RadioTower, label: 'Frequency Bands' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/communication-windows', icon: Clock, label: 'Communication Windows' },
      { path: '/scheduling', icon: Calendar, label: 'Scheduling' },
      { path: '/booking-approvals', icon: CheckCircle, label: 'Booking Approvals' },
      { path: '/communication-sessions', icon: Activity, label: 'Communication Sessions' },
      { path: '/scheduling-recommendations', icon: BarChart3, label: 'Scheduling Recommendations' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { path: '/engineers', icon: Users, label: 'Engineers' },
      { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
      { path: '/weather', icon: Cloud, label: 'Weather' },
    ]
  },
  {
    title: 'Monitoring',
    items: [
      { path: '/telemetry', icon: Activity, label: 'Telemetry' },
      { path: '/command-logs', icon: Terminal, label: 'Command Logs' },
      { path: '/alerts', icon: Bell, label: 'Alerts' },
    ]
  },
  {
    title: 'Administration',
    items: [
      { path: '/reports', icon: FileText, label: 'Reports' },
      { path: '/users', icon: UserCog, label: 'Users / Admin' },
    ]
  }
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <SatelliteDish size={24} className="logo-icon" />
          {!collapsed && <span className="logo-text">SATLINK</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="nav-group">
            {!collapsed && <div className="nav-group-title">{group.title}</div>}
            <ul className="nav-list">
              {group.items.map((item) => (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : ''}
                  >
                    <item.icon size={18} className="nav-icon" />
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
