import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Search, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

function Inventory({ token }) {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState({
    id: '',
    name: '',
    category: '',
    stock: '',
    price: '',
    expiry: '',
    supplier: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data);
      setFilteredInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isExpiringWithinTwoMonths = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    return expiry <= twoMonthsFromNow;
  };

  const isExpired = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const validateExpiryDate = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    if (expiry < today) {
      return { valid: false, message: 'Cannot add expired medicine' };
    }
    
    if (expiry <= twoMonthsFromNow) {
      return { valid: false, message: 'Cannot add medicine expiring within 2 months' };
    }

    return { valid: true };
  };

  const handleAddClick = () => {
    setEditMode(false);
    setCurrentMedicine({
      id: '',
      name: '',
      category: '',
      stock: '',
      price: '',
      expiry: '',
      supplier: ''
    });
    setShowModal(true);
    setError('');
  };

  const handleEditClick = (medicine) => {
    setEditMode(true);
    setCurrentMedicine(medicine);
    setShowModal(true);
    setError('');
  };

  const handleDeleteClick = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`/inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Medicine deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchInventory();
      } catch (error) {
        setError('Failed to delete medicine');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate expiry date only for new medicines
    if (!editMode) {
      const validation = validateExpiryDate(currentMedicine.expiry);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
    }

    try {
      if (editMode) {
        await axios.put(`/inventory/${currentMedicine.id}`, currentMedicine, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Medicine updated successfully');
      } else {
        await axios.post('/inventory', currentMedicine, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Medicine added successfully');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save medicine');
    }
  };

  const handleInputChange = (e) => {
    setCurrentMedicine({
      ...currentMedicine,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track and manage medicine stock</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search medicines by name, category, or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price (RWF)</th>
              <th>Expiry Date</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    {isExpiringWithinTwoMonths(item.expiry) && (
                      <span style={{ marginLeft: '8px' }}>
                        <AlertTriangle size={16} color="#f59e0b" style={{ verticalAlign: 'middle' }} />
                      </span>
                    )}
                  </td>
                  <td><span className="category-badge">{item.category}</span></td>
                  <td>
                    <span className={item.stock < 150 ? 'stock-low' : 'stock-ok'}>
                      {item.stock} units
                    </span>
                  </td>
                  <td>RWF {item.price}</td>
                  <td>
                    <span className={isExpiringWithinTwoMonths(item.expiry) ? 'expiry-warning' : ''}>
                      {item.expiry}
                      {isExpired(item.expiry) && ' (EXPIRED)'}
                      {!isExpired(item.expiry) && isExpiringWithinTwoMonths(item.expiry) && ' (Expiring Soon)'}
                    </span>
                  </td>
                  <td>{item.supplier}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => handleEditClick(item)}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDeleteClick(item.id, item.name)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <Package size={48} color="#94a3b8" />
                    <h3>No medicines found</h3>
                    <p>Start by adding your first medicine to inventory</p>
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
              <h2>{editMode ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Medicine Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={currentMedicine.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Paracetamol 500mg"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={currentMedicine.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={currentMedicine.stock}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (RWF) *</label>
                    <input
                      type="number"
                      name="price"
                      value={currentMedicine.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.50"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      name="expiry"
                      value={currentMedicine.expiry}
                      onChange={handleInputChange}
                      required
                    />
                    {!editMode && <p className="text-sm text-gray" style={{ marginTop: '4px' }}>
                      ⚠️ Cannot add medicines expiring within 2 months
                    </p>}
                  </div>

                  <div className="form-group">
                    <label>Supplier *</label>
                    <select
                      name="supplier"
                      value={currentMedicine.supplier}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map(sup => (
                        <option key={sup.id} value={sup.name}>{sup.name}</option>
                      ))}
                    </select>
                    {suppliers.length === 0 && (
                      <p className="text-sm" style={{ color: '#f59e0b', marginTop: '4px' }}>
                        No suppliers found. Add suppliers in Settings first.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Update Medicine' : 'Add Medicine'}
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

        .expiry-warning {
          color: #f59e0b;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default Inventory;
