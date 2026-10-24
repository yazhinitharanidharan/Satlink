import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
