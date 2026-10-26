import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ChevronDown, Wifi, WifiOff, User, Settings, LogOut, Check, Satellite } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const pageTitles = {
  '/': 'Mission Control',
  '/missions': 'Missions',
  '/satellites': 'Satellites',
  '/payloads': 'Payloads',
  '/ground-stations': 'Ground Stations',
  '/antennas': 'Antennas',
  '/frequency-bands': 'Frequency Bands',
  '/communication-windows': 'Communication Windows',
  '/scheduling': 'Scheduling',
  '/communication-sessions': 'Communication Sessions',
  '/scheduling-recommendations': 'Scheduling Recommendations',
  '/engineers': 'Engineers',
  '/maintenance': 'Maintenance',
  '/weather': 'Weather',
  '/telemetry': 'Telemetry',
  '/command-logs': 'Command Logs',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/users': 'Users / Administration',
};

const Header = ({ toggleSidebar, toggleMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, update, error: dataError } = useData();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const alerts = data.alerts || [];
  const unread = alerts.filter(a => a.status === 'unread').length;

  const displayName = user?.full_name || user?.user_name || 'Operator';
  const displayRole = user?.role || 'User';
  const displayEmail = user?.email || '—';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('') || 'OP';

  const searchIndex = useMemo(() => {
    const index = [];
    (data.missions || []).forEach(m => index.push({ id: `mission-${m.mission_id}`, label: m.mission_name, group: 'Mission', path: '/missions' }));
    (data.satellites || []).forEach(s => index.push({ id: `sat-${s.sat_id}`, label: s.sat_name, group: 'Satellite', path: '/satellites' }));
    (data.payloads || []).forEach(p => index.push({ id: `payload-${p.payload_id}`, label: p.payload_name, group: 'Payload', path: '/payloads' }));
    (data.groundStations || []).forEach(g => index.push({ id: `gs-${g.gs_id}`, label: g.gs_name, group: 'Ground Station', path: '/ground-stations' }));
    (data.antennas || []).forEach(a => index.push({ id: `ant-${a.ant_id}`, label: a.ant_name, group: 'Antenna', path: '/antennas' }));
    (data.frequencyBands || []).forEach(b => index.push({ id: `band-${b.band_id}`, label: b.band_name, group: 'Frequency Band', path: '/frequency-bands' }));
    (data.communicationSessions || []).forEach(s => index.push({ id: `session-${s.session_id}`, label: String(s.session_id), group: 'Session', path: '/communication-sessions' }));
    (data.engineers || []).forEach(e => index.push({ id: `eng-${e.eng_id}`, label: e.eng_name, group: 'Engineer', path: '/engineers' }));
    (data.alerts || []).forEach(a => index.push({ id: `alert-${a.alert_id}`, label: a.description, group: 'Alert', path: '/alerts' }));
    (data.communicationWindows || []).forEach(w => index.push({ id: `window-${w.window_id}`, label: `Window #${w.window_id}`, group: 'Communication Window', path: '/communication-windows' }));
    (data.maintenanceLogs || []).forEach(m => index.push({ id: `maint-${m.maint_id}`, label: m.description, group: 'Maintenance', path: '/maintenance' }));
    return index;
  }, [data]);

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return searchIndex.filter(item => String(item.label || '').toLowerCase().includes(term)).slice(0, 8);
  }, [searchTerm, searchIndex]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchTerm('');
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setSearchOpen(false);
    setSearchTerm('');
    setNotifOpen(false);
    setProfileOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) setHighlight(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlight]) goTo(results[highlight].path);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const markRead = async (alert, e) => {
    e.stopPropagation();
    setNotificationError('');

    try {
      await update('alerts', 'alert_id', alert.alert_id, { status: 'acknowledged' });
    } catch (error) {
      setNotificationError(error?.message || 'Unable to mark the alert as read.');
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={toggleMobileMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <button className="header-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>
        <div className="header-breadcrumb">
          <h1 className="header-title">{pageTitles[location.pathname] || 'SATLINK'}</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search" ref={searchRef}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search records..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setHighlight(0); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Global search"
            aria-expanded={searchOpen}
            role="combobox"
            aria-controls="global-search-results"
          />
          {searchOpen && searchTerm && (
            <div className="search-results" id="global-search-results" role="listbox">
              {results.length === 0 ? (
                <div className="search-empty">No matching records for “{searchTerm}”.</div>
              ) : results.map((r, i) => (
                <button
                  key={r.id}
                  role="option"
                  aria-selected={i === highlight}
                  className={`search-result ${i === highlight ? 'highlighted' : ''}`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => goTo(r.path)}
                >
                  <span className="search-result-label">{r.label}</span>
                  <span className="search-result-group">{r.group}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className={`connection-status ${dataError ? 'disconnected' : 'connected'}`}
          title={dataError || 'Connected to the SATLINK backend API.'}
        >
          {dataError ? <WifiOff size={14} /> : <Wifi size={14} />}
          <span>{dataError ? 'Offline' : 'Live'}</span>
        </div>

        <div className="notifications-wrapper" ref={notifRef}>
          <button
            className="header-notification-btn"
            aria-label={`Notifications (${unread} unread)`}
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            aria-expanded={notifOpen}
          >
            <Bell size={18} />
            {unread > 0 && <span className="notification-badge">{unread}</span>}
          </button>
          {notifOpen && (
            <div className="dropdown-panel notifications-panel">
              <div className="dropdown-header">
                <span>Notifications</span>
                <span className="dropdown-count">{unread} unread</span>
              </div>
              {notificationError && (
                <div className="dropdown-error" role="alert">{notificationError}</div>
              )}
              {alerts.length === 0 ? (
                <div className="dropdown-empty">No notifications.</div>
              ) : (
                alerts.slice(0, 6).map(alert => (
                  <div
                    key={alert.alert_id}
                    className="notification-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => goTo('/alerts')}
                    onKeyDown={(e) => e.key === 'Enter' && goTo('/alerts')}
                  >
                    <span className={`notification-dot severity-${alert.severity}`} aria-hidden="true" />
                    <div className="notification-body">
                      <div className="notification-text">{alert.description}</div>
                      <div className="notification-meta">
                        {alert.category} · {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {alert.status === 'unread' && (
                      <button
                        className="notification-mark"
                        onClick={(e) => markRead(alert, e)}
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
              <button className="dropdown-footer-btn" onClick={() => goTo('/alerts')}>View all alerts</button>
            </div>
          )}
        </div>

        <div className="profile-wrapper" ref={profileRef}>
          <button
            className="header-user"
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-role">{displayRole}</div>
            </div>
            <ChevronDown size={16} className="user-chevron" />
          </button>
          {profileOpen && (
            <div className="dropdown-panel profile-panel">
              <div className="profile-header">
                <div className="user-avatar large">{initials}</div>
                <div>
                  <div className="profile-name">{displayName}</div>
                  <div className="profile-email">{displayEmail}</div>
                </div>
              </div>
              <div className="profile-role-row">
                <span className="profile-role-label">Role</span>
                <span className="profile-role-value">{displayRole}</span>
              </div>
              <button className="dropdown-item" onClick={() => goTo('/users')}>
                <User size={15} /> User directory
              </button>
              <button className="dropdown-item" onClick={() => goTo('/reports')}>
                <Settings size={15} /> Reports
              </button>
              <button className="dropdown-item" onClick={() => goTo('/alerts')}>
                <Bell size={15} /> Notifications
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => goTo('/')}>
                <Satellite size={15} /> Mission Control
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
