import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Users, Truck, Tag, CreditCard, DollarSign } from 'lucide-react';

function Settings({ token }) {
  const [activeSection, setActiveSection] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [creditCustomers, setCreditCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Category state
  const [currentCategory, setCurrentCategory] = useState({ id: '', name: '' });

  // Supplier state
  const [currentSupplier, setCurrentSupplier] = useState({
    id: '',
    name: '',
    contact: '',
    phone: '',
    email: ''
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (activeSection === 'categories') {
        const response = await axios.get('/categories', { headers });
        setCategories(response.data);
      } else if (activeSection === 'suppliers') {
        const response = await axios.get('/suppliers', { headers });
        setSuppliers(response.data);
      } else if (activeSection === 'customers') {
        const response = await axios.get('/customers', { headers });
        setCustomers(response.data);
      } else if (activeSection === 'credit') {
        const response = await axios.get('/customers/with-credit', { headers });
        setCreditCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Category Functions
  const handleAddCategory = () => {
    setModalType('category');
    setEditMode(false);
    setCurrentCategory({ id: '', name: '' });
    setShowModal(true);
    setError('');
  };

  const handleEditCategory = (category) => {
    setModalType('category');
    setEditMode(true);
    setCurrentCategory(category);
    setShowModal(true);
    setError('');
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await axios.delete(`/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Category deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchData();
      } catch (error) {
        setError('Failed to delete category');
      }
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editMode) {
        await axios.put(`/categories/${currentCategory.id}`, currentCategory, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Category updated successfully');
      } else {
        await axios.post('/categories', currentCategory, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Category added successfully');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save category');
    }
  };

  // Supplier Functions
  const handleAddSupplier = () => {
    setModalType('supplier');
    setEditMode(false);
    setCurrentSupplier({ id: '', name: '', contact: '', phone: '', email: '' });
    setShowModal(true);
    setError('');
  };

  const handleEditSupplier = (supplier) => {
    setModalType('supplier');
    setEditMode(true);
    setCurrentSupplier(supplier);
    setShowModal(true);
    setError('');
  };

  const handleDeleteSupplier = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete supplier "${name}"?`)) {
      try {
        await axios.delete(`/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Supplier deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchData();
      } catch (error) {
        setError('Failed to delete supplier');
      }
    }
  };

  const handleSubmitSupplier = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const supplierData = {
        name: currentSupplier.name,
        contact: currentSupplier.contact || '',
        phone: currentSupplier.phone || '',
        email: currentSupplier.email || ''
      };

      if (editMode) {
        await axios.put(`/suppliers/${currentSupplier.id}`, supplierData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Supplier updated successfully');
      } else {
        await axios.post('/suppliers', supplierData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Supplier added successfully');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save supplier');
    }
  };

  // Credit Functions
  const handlePayCredit = async (customerId, customerName, currentCredit) => {
    const amountPaid = prompt(`How much is ${customerName} paying?\nCurrent credit: RWF ${currentCredit}`);
    
    if (amountPaid === null) return; // User cancelled
    
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > currentCredit) {
      setError('Amount cannot exceed credit balance');
      return;
    }

    try {
      const newCredit = currentCredit - amount;
      await axios.put(`/customers/${customerId}`, {
        credit: newCredit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage(`Payment of RWF ${amount} recorded successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (error) {
      setError('Failed to record payment');
    }
  };

  const handleClearCredit = async (customerId, customerName) => {
    if (window.confirm(`Mark all credit as paid for ${customerName}?`)) {
      try {
        await axios.put(`/customers/${customerId}`, {
          credit: 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Credit cleared successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchData();
      } catch (error) {
        setError('Failed to clear credit');
      }
    }
  };

  const renderCategoriesSection = () => (
    <div>
      <div className="section-header">
        <div>
          <h2>Medicine Categories</h2>
          <p className="text-gray">Manage product categories for your inventory</p>
        </div>
        <button className="btn-primary" onClick={handleAddCategory}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="settings-grid">
        {categories.length > 0 ? (
          categories.map(category => (
            <div key={category.id} className="setting-card">
              <div className="setting-icon">
                <Tag size={24} />
              </div>
              <div className="setting-info">
                <h3>{category.name}</h3>
                <p className="text-sm text-gray">Category ID: {category.id}</p>
              </div>
              <div className="action-buttons">
                <button className="icon-btn" onClick={() => handleEditCategory(category)}>
                  <Edit size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => handleDeleteCategory(category.id, category.name)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <Tag size={48} color="#94a3b8" />
            <h3>No categories yet</h3>
            <p>Add your first category to organize medicines</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSuppliersSection = () => (
    <div>
      <div className="section-header">
        <div>
          <h2>Suppliers</h2>
          <p className="text-gray">Manage your medicine suppliers and their contact information</p>
        </div>
        <button className="btn-primary" onClick={handleAddSupplier}>
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length > 0 ? (
              suppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td><strong>{supplier.name}</strong></td>
                  <td>{supplier.contact || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>{supplier.email || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => handleEditSupplier(supplier)}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <Truck size={48} color="#94a3b8" />
                    <h3>No suppliers yet</h3>
                    <p>Add your first supplier</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomersSection = () => (
    <div>
      <div className="section-header">
        <div>
          <h2>Customer Database</h2>
          <p className="text-gray">View all registered customers and their purchase history</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Total Purchases</th>
              <th>Credit Balance</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>RWF {customer.total_purchases?.toLocaleString() || 0}</td>
                  <td>
                    <span className={customer.credit > 0 ? 'credit-owed' : 'credit-clear'}>
                      RWF {customer.credit || 0}
                    </span>
                  </td>
                  <td>{customer.last_visit || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <Users size={48} color="#94a3b8" />
                    <h3>No customers yet</h3>
                    <p>Customers will appear here after their first purchase</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCreditCustomersSection = () => {
    const totalCredit = creditCustomers.reduce((sum, customer) => sum + (customer.credit || 0), 0);

    return (
      <div>
        <div className="section-header">
          <div>
            <h2>Credit Customers</h2>
            <p className="text-gray">Track and manage customers with outstanding credit</p>
          </div>
          <div style={{ background: '#fee2e2', padding: '12px 20px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '14px', color: '#991b1b', marginBottom: '4px' }}>Total Outstanding Credit</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              RWF {totalCredit.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Credit Balance</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {creditCustomers.length > 0 ? (
                creditCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td><strong>{customer.name}</strong></td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.email || '-'}</td>
                    <td>
                      <span style={{ 
                        color: '#dc2626', 
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        RWF {customer.credit?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td>{customer.last_visit || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-sm btn-success"
                          onClick={() => handlePayCredit(customer.id, customer.name, customer.credit)}
                          style={{ 
                            padding: '6px 12px',
                            fontSize: '13px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <DollarSign size={14} /> Pay
                        </button>
                        <button 
                          className="btn-sm"
                          onClick={() => handleClearCredit(customer.id, customer.name)}
                          style={{ 
                            padding: '6px 12px',
                            fontSize: '13px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Clear All
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="empty-state">
                      <CreditCard size={48} color="#94a3b8" />
                      <h3>No credit customers</h3>
                      <p>All customers have cleared their credit! 🎉</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage system settings and configurations</p>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="settings-nav">
        <button
          className={`settings-nav-item ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          <Tag size={20} />
          <span>Categories</span>
        </button>
        <button
          className={`settings-nav-item ${activeSection === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveSection('suppliers')}
        >
          <Truck size={20} />
          <span>Suppliers</span>
        </button>
        <button
          className={`settings-nav-item ${activeSection === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveSection('customers')}
        >
          <Users size={20} />
          <span>Customers</span>
        </button>
        <button
          className={`settings-nav-item ${activeSection === 'credit' ? 'active' : ''}`}
          onClick={() => setActiveSection('credit')}
        >
          <CreditCard size={20} />
          <span>Credit Customers</span>
          {creditCustomers.length > 0 && (
            <span style={{
              background: '#dc2626',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginLeft: '8px'
            }}>
              {creditCustomers.length}
            </span>
          )}
        </button>
      </div>

      <div className="settings-content">
        {activeSection === 'categories' && renderCategoriesSection()}
        {activeSection === 'suppliers' && renderSuppliersSection()}
        {activeSection === 'customers' && renderCustomersSection()}
        {activeSection === 'credit' && renderCreditCustomersSection()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {modalType === 'category'
                  ? (editMode ? 'Edit Category' : 'Add Category')
                  : (editMode ? 'Edit Supplier' : 'Add Supplier')
                }
              </h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={modalType === 'category' ? handleSubmitCategory : handleSubmitSupplier}>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}

                {modalType === 'category' ? (
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      value={currentCategory.name}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                      placeholder="e.g., Pain Relief, Antibiotics"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Supplier Name *</label>
                      <input
                        type="text"
                        value={currentSupplier.name}
                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                        placeholder="e.g., PharmaCorp Ltd"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Person</label>
                      <input
                        type="text"
                        value={currentSupplier.contact}
                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, contact: e.target.value })}
                        placeholder="e.g., John Smith"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={currentSupplier.phone}
                          onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                          placeholder="+250 788 123 456"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={currentSupplier.email}
                          onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                          placeholder="supplier@example.com"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Update' : 'Add'} {modalType === 'category' ? 'Category' : 'Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .success-message {
          background: #dcfce7;
          border: 1px solid #86efac;
          color: #166534;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .settings-nav {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          border-bottom: 2px solid #e2e8f0;
          overflow-x: auto;
        }

        .settings-nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #64748b;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .settings-nav-item:hover {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .settings-nav-item.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .settings-content {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-header {
          display: flex;
          justifyContent: space-between;
          alignItems: center;
          marginBottom: 24px;
          gap: 24px;
        }

        .section-header > div {
          flex: 0 1 auto;
        }

        .section-header button {
          flex-shrink: 0;
          margin-left: auto;
        }

        .section-header h2 {
          font-size: 22px;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .setting-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .setting-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .setting-icon {
          width: 48px;
          height: 48px;
          background: #dbeafe;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .credit-owed {
          color: #dc2626;
          font-weight: 600;
        }

        .credit-clear {
          color: #10b981;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default Settings;