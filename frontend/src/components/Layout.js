import React from 'react';
import { Package, ShoppingCart, FileText, TrendingUp, LogOut, Settings } from 'lucide-react';

function Layout({ user, activeTab, onTabChange, onLogout, children }) {
  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon">
              <Package size={24} />
            </div>
            <div className="logo-text">
              <h2>MyPharma</h2>
              <p>Pharmacy Management</p>
            </div>
          </div>
        </div>

        <div className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            <TrendingUp size={20} />
            <span>Dashboard</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => onTabChange('inventory')}
          >
            <Package size={20} />
            <span>Inventory</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => onTabChange('sales')}
          >
            <ShoppingCart size={20} />
            <span>Sales</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => onTabChange('reports')}
          >
            <FileText size={20} />
            <span>Reports</span>
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '12px 0' }}></div>
          
          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onTabChange('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>{user?.pharmacyName || 'Pharmacy Management Software'}</h1>
          <div className="user-section">
            <div className="user-info">
              <div className="user-name">{user?.ownerName}</div>
              <div className="user-role">{user?.role || 'Pharmacist'}</div>
            </div>
            <div className="user-avatar">
              {user?.ownerName?.charAt(0) || 'U'}
            </div>
          </div>
        </div>

        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
