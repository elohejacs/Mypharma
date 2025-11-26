import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Edit, Trash2, X } from 'lucide-react';

function Customers({ token }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    credit: 0
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditMode(false);
    setCurrentCustomer({
      id: '',
      name: '',
      phone: '',
      email: '',
      credit: 0
    });
    setShowModal(true);
    setError('');
  };

  const handleEditClick = (customer) => {
    setEditMode(true);
    setCurrentCustomer(customer);
    setShowModal(true);
    setError('');
  };

  const handleDeleteClick = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer ${name}?`)) {
      try {
        await axios.delete(`/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Customer deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchCustomers();
      } catch (error) {
        setError('Failed to delete customer');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editMode) {
        await axios.put(`/customers/${currentCustomer.id}`, currentCustomer, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Customer updated successfully');
      } else {
        await axios.post('/customers', currentCustomer, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Customer added successfully');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save customer');
    }
  };

  const handleInputChange = (e) => {
    setCurrentCustomer({
      ...currentCustomer,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Management</h1>
          <p className="page-subtitle">Manage customer information and prescriptions</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search customers by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Total Purchases</th>
              <th>Last Visit</th>
              <th>Prescriptions</th>
              <th>Credit Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td>RWF {customer.total_purchases?.toLocaleString() || 0}</td>
                  <td>{customer.last_visit}</td>
                  <td><span className="badge">{customer.prescriptions || 0}</span></td>
                  <td>
                    <span className={customer.credit > 0 ? 'credit-owed' : 'credit-clear'}>
                      RWF {customer.credit || 0}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => handleEditClick(customer)}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDeleteClick(customer.id, customer.name)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <Users size={48} color="#94a3b8" />
                    <h3>No customers found</h3>
                    <p>Start by adding your first customer</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editMode ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={currentCustomer.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={currentCustomer.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +250 788 123 456"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={currentCustomer.email}
                      onChange={handleInputChange}
                      placeholder="e.g., john@example.com"
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="form-group">
                    <label>Credit Balance (RWF)</label>
                    <input
                      type="number"
                      name="credit"
                      value={currentCustomer.credit}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Update Customer' : 'Add Customer'}
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
      `}</style>
    </div>
  );
}

export default Customers;