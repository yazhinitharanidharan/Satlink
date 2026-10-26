import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useData } from '../context/DataContext';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { loading, error, refresh } = useData();

  return (
    <div className="app-layout">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="page-content">
          {error && (
            <div className="data-error-banner" role="alert">
              <span>{error}</span>
              <button type="button" onClick={refresh}>Retry</button>
            </div>
          )}
          {loading && !error && (
            <div className="data-loading-banner">Loading data from SATLINK...</div>
          )}
          {children}
        </main>
      </div>
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
