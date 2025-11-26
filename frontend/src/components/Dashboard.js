import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Package, Users, AlertCircle } from 'lucide-react';

function Dashboard({ token }) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    productsSold: 0,
    totalCustomers: 0
  });
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]); // Added token dependency

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, lowStockRes, salesRes] = await Promise.all([
        axios.get('/reports/stats', { headers }),
        axios.get('/inventory/low-stock', { headers }),
        axios.get('/reports/recent-sales?limit=5', { headers })
      ]);

      setStats(statsRes.data);
      setLowStock(lowStockRes.data);
      setRecentSales(salesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="content-area">
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-subtitle">Quick insights into your pharmacy performance</p>
      
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">RWF {stats.totalRevenue?.toLocaleString() || 0}</div>
          </div>
        </div>
        
        <div className="stat-card sales">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value">{stats.totalSales?.toLocaleString() || 0}</div>
          </div>
        </div>
        
        <div className="stat-card products">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Products in Stock</div>
            <div className="stat-value">{stats.productsSold?.toLocaleString() || 0}</div>
          </div>
        </div>
        
        <div className="stat-card customers">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Customers</div>
            <div className="stat-value">{stats.totalCustomers || 0}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Low Stock Alert</h3>
          <div className="alert-list">
            {lowStock.length > 0 ? (
              lowStock.map(item => (
                <div key={item.id} className="alert-item">
                  <AlertCircle size={18} color="#f59e0b" />
                  <span>{item.name} - Only {item.stock} units left</span>
                </div>
              ))
            ) : (
              <p className="text-gray">All items are well stocked</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Recent Sales</h3>
          <div className="recent-list">
            {recentSales.length > 0 ? (
              recentSales.map(sale => (
                <div key={sale.id} className="recent-item">
                  <div>
                    <strong>{sale.customer_name}</strong>
                    <div className="text-sm text-gray">{sale.date}</div>
                  </div>
                  <span className="badge">RWF {sale.total}</span>
                </div>
              ))
            ) : (
              <p className="text-gray">No sales yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;