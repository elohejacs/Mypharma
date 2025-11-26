import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Reports({ token }) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    productsSold: 0,
    totalCustomers: 0,
    outstandingCredit: 0,
    stockValue: 0
  });
  const [topMedicines, setTopMedicines] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, topMedRes, categoryRes] = await Promise.all([
        axios.get('/reports/stats', { headers }),
        axios.get('/reports/top-medicines', { headers }),
        axios.get('/reports/sales-by-category', { headers })
      ]);

      setStats(statsRes.data);
      setTopMedicines(topMedRes.data);
      setSalesByCategory(categoryRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Pharmacy Management Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${date}`, 14, 28);
    
    // Business Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Business Summary', 14, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `RWF ${stats.totalRevenue?.toLocaleString() || 0}`],
        ['Total Sales', stats.totalSales?.toLocaleString() || 0],
        ['Total Customers', stats.totalCustomers || 0],
        ['Products in Stock', stats.productsSold?.toLocaleString() || 0],
        ['Outstanding Credit', `RWF ${stats.outstandingCredit?.toLocaleString() || 0}`],
        ['Stock Value', `RWF ${stats.stockValue?.toLocaleString() || 0}`],
        ['Average Sale Value', `RWF ${stats.totalSales > 0 ? Math.round(stats.totalRevenue / stats.totalSales).toLocaleString() : 0}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Top Medicines
    const finalY = doc.lastAutoTable.finalY || 45;
    doc.setFontSize(14);
    doc.text('Top Selling Medicines', 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Rank', 'Medicine Name', 'Category', 'Stock']],
      body: topMedicines.slice(0, 10).map((med, idx) => [
        idx + 1,
        med.name,
        med.category,
        `${med.stock} units`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Sales by Category
    const finalY2 = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text('Sales by Category', 14, finalY2 + 15);
    
    const total = salesByCategory.reduce((sum, cat) => sum + cat.total, 0);
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['Category', 'Count', 'Total Value', 'Percentage']],
      body: salesByCategory.map(cat => [
        cat.category,
        cat.count,
        `RWF ${cat.total?.toLocaleString() || 0}`,
        `${Math.round((cat.total / total) * 100)}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`Pharmacy-Report-${date}.pdf`);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['Pharmacy Management Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ['Business Summary'],
      ['Metric', 'Value'],
      ['Total Revenue', `RWF ${stats.totalRevenue?.toLocaleString() || 0}`],
      ['Total Sales', stats.totalSales?.toLocaleString() || 0],
      ['Total Customers', stats.totalCustomers || 0],
      ['Products in Stock', stats.productsSold?.toLocaleString() || 0],
      ['Outstanding Credit', `RWF ${stats.outstandingCredit?.toLocaleString() || 0}`],
      ['Stock Value', `RWF ${stats.stockValue?.toLocaleString() || 0}`]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Top Medicines Sheet
    const medicinesData = [
      ['Rank', 'Medicine Name', 'Category', 'Stock', 'Price'],
      ...topMedicines.map((med, idx) => [
        idx + 1,
        med.name,
        med.category,
        med.stock,
        med.price
      ])
    ];
    const medicinesSheet = XLSX.utils.aoa_to_sheet(medicinesData);
    XLSX.utils.book_append_sheet(wb, medicinesSheet, 'Top Medicines');
    
    // Sales by Category Sheet
    const total = salesByCategory.reduce((sum, cat) => sum + cat.total, 0);
    const categoryData = [
      ['Category', 'Count', 'Total Value', 'Percentage'],
      ...salesByCategory.map(cat => [
        cat.category,
        cat.count,
        cat.total,
        `${Math.round((cat.total / total) * 100)}%`
      ])
    ];
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Sales by Category');
    
    XLSX.writeFile(wb, `Pharmacy-Report-${new Date().toLocaleDateString()}.xlsx`);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    let csv = 'Pharmacy Management Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    csv += 'Business Summary\n';
    csv += 'Metric,Value\n';
    csv += `Total Revenue,RWF ${stats.totalRevenue?.toLocaleString() || 0}\n`;
    csv += `Total Sales,${stats.totalSales?.toLocaleString() || 0}\n`;
    csv += `Total Customers,${stats.totalCustomers || 0}\n`;
    csv += `Products in Stock,${stats.productsSold?.toLocaleString() || 0}\n`;
    csv += `Outstanding Credit,RWF ${stats.outstandingCredit?.toLocaleString() || 0}\n`;
    csv += `Stock Value,RWF ${stats.stockValue?.toLocaleString() || 0}\n\n`;
    
    csv += 'Top Selling Medicines\n';
    csv += 'Rank,Medicine Name,Category,Stock\n';
    topMedicines.forEach((med, idx) => {
      csv += `${idx + 1},${med.name},${med.category},${med.stock}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Pharmacy-Report-${new Date().toLocaleDateString()}.csv`);
    setShowExportMenu(false);
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">View detailed insights and analytics</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-primary" 
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download size={18} /> Export Report
          </button>
          
          {showExportMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '50px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 10,
              minWidth: '200px'
            }}>
              <button
                onClick={handleExportPDF}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  borderBottom: '1px solid #f1f5f9'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <FileText size={16} color="#dc2626" />
                Export as PDF
              </button>
              <button
                onClick={handleExportExcel}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  borderBottom: '1px solid #f1f5f9'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <FileSpreadsheet size={16} color="#10b981" />
                Export as Excel
              </button>
              <button
                onClick={handleExportCSV}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <FileText size={16} color="#3b82f6" />
                Export as CSV
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="report-filters">
        <select
          className="filter-select"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
        </select>
        <select className="filter-select">
          <option>All Categories</option>
          <option>Pain Relief</option>
          <option>Antibiotics</option>
          <option>Supplements</option>
          <option>Allergy</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Daily Average</h4>
          <div className="stat-big">RWF {Math.round(stats.totalRevenue / 30).toLocaleString()}</div>
          <div className="stat-change positive">Based on monthly revenue</div>
        </div>
        <div className="stat-card">
          <h4>Weekly Revenue</h4>
          <div className="stat-big">RWF {Math.round(stats.totalRevenue / 4).toLocaleString()}</div>
          <div className="stat-change positive">Average per week</div>
        </div>
        <div className="stat-card">
          <h4>Outstanding Credit</h4>
          <div className="stat-big">RWF {stats.outstandingCredit?.toLocaleString() || 0}</div>
          <div className="stat-change neutral">To be collected</div>
        </div>
        <div className="stat-card">
          <h4>Stock Value</h4>
          <div className="stat-big">RWF {stats.stockValue?.toLocaleString() || 0}</div>
          <div className="stat-change neutral">Current inventory worth</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Top Selling Medicines</h3>
          <div className="top-items">
            {topMedicines.length > 0 ? (
              topMedicines.slice(0, 10).map((medicine, index) => (
                <div key={medicine.name} className="top-item">
                  <span>{index + 1}. {medicine.name}</span>
                  <strong>{medicine.stock} units</strong>
                </div>
              ))
            ) : (
              <p className="text-gray">No data available</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Sales by Category</h3>
          <div className="category-stats">
            {salesByCategory.length > 0 ? (
              salesByCategory.map(category => {
                const total = salesByCategory.reduce((sum, cat) => sum + cat.total, 0);
                const percentage = Math.round((category.total / total) * 100);

                return (
                  <div key={category.category} className="category-row">
                    <span>{category.category}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                          background: getColorForCategory(category.category)
                        }}
                      ></div>
                    </div>
                    <strong>{percentage}%</strong>
                  </div>
                );
              })
            ) : (
              <p className="text-gray">No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Business Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Total Revenue</div>
            <div className="summary-value">RWF {stats.totalRevenue?.toLocaleString() || 0}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Sales</div>
            <div className="summary-value">{stats.totalSales?.toLocaleString() || 0}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Customers</div>
            <div className="summary-value">{stats.totalCustomers || 0}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Products in Stock</div>
            <div className="summary-value">{stats.productsSold?.toLocaleString() || 0}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Average Sale Value</div>
            <div className="summary-value">
              RWF {stats.totalSales > 0
                ? Math.round(stats.totalRevenue / stats.totalSales).toLocaleString()
                : 0}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Credit Recovery Rate</div>
            <div className="summary-value">
              {stats.outstandingCredit > 0
                ? Math.round((1 - stats.outstandingCredit / stats.totalRevenue) * 100)
                : 100}%
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }

        .summary-item {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
        }

        .summary-label {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .summary-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
}

// Helper function to assign colors to categories
function getColorForCategory(category) {
  const colors = {
    'Pain Relief': '#3b82f6',
    'Antibiotics': '#10b981',
    'Supplements': '#f59e0b',
    'Allergy': '#8b5cf6',
    'Vitamins': '#ec4899',
    'Other': '#6b7280'
  };
  return colors[category] || '#6b7280';
}

export default Reports;