import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Search, Trash2, X, Minus } from 'lucide-react';

function Sales({ token }) {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSales();
    fetchInventory();
  }, []);

  useEffect(() => {
    const filtered = sales.filter(sale =>
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSales(filtered);
  }, [searchTerm, sales]);

  const fetchSales = async () => {
    try {
      const response = await axios.get('/sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data);
      setFilteredSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data.filter(item => item.stock > 0));
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedMedicine) {
      setError('Please select a medicine');
      return;
    }

    const medicine = inventory.find(m => m.id === selectedMedicine);
    if (!medicine) return;

    if (quantity > medicine.stock) {
      setError(`Only ${medicine.stock} units available in stock`);
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > medicine.stock) {
        setError(`Only ${medicine.stock} units available in stock`);
        return;
      }
      setCart(cart.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: medicine.id,
        name: medicine.name,
        price: medicine.price,
        quantity: quantity,
        subtotal: quantity * medicine.price,
        maxStock: medicine.stock
      }]);
    }

    setSelectedMedicine('');
    setQuantity(1);
    setError('');
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    const item = cart.find(i => i.id === id);
    if (newQuantity > item.maxStock) {
      setError(`Only ${item.maxStock} units available`);
      return;
    }
    if (newQuantity < 1) return;
    
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
  };

  const handleNewSale = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', email: '' });
    setSelectedMedicine('');
    setQuantity(1);
    setPaymentMethod('Cash');
    setShowModal(true);
    setError('');
  };

  const handleSubmitSale = async () => {
    if (!customerInfo.name) {
      setError('Customer name is required');
      return;
    }

    if (cart.length === 0) {
      setError('Please add at least one item to cart');
      return;
    }

    try {
      // First, create or get customer
      const customerResponse = await axios.post('/customers', {
        name: customerInfo.name,
        phone: customerInfo.phone || '',
        email: customerInfo.email || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const customerId = customerResponse.data.customer?.id || 'CUST' + Date.now();

      // Create items string
      const itemsString = cart.map(item => 
        `${item.name} (${item.quantity})`
      ).join(', ');

      // Submit sale
      await axios.post('/sales', {
        customer_id: customerId,
        customer_name: customerInfo.name,
        items: itemsString,
        total: calculateTotal(),
        payment_method: paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update stock for each item
      for (const item of cart) {
        const medicine = inventory.find(m => m.id === item.id);
        await axios.put(`/inventory/${item.id}`, {
          ...medicine,
          stock: medicine.stock - item.quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setSuccessMessage('Sale completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchSales();
      fetchInventory();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to complete sale');
    }
  };

  const handleDeleteSale = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await axios.delete(`/sales/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Sale deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchSales();
      } catch (error) {
        setError('Failed to delete sale');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading sales...</div>;
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Management</h1>
          <p className="page-subtitle">Process and track daily sales transactions</p>
        </div>
        <button className="btn-primary" onClick={handleNewSale}>
          <Plus size={18} /> New Sale
        </button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search sales by customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.date}</td>
                  <td><strong>{sale.customer_name}</strong></td>
                  <td className="text-sm">{sale.items}</td>
                  <td><strong>RWF {sale.total}</strong></td>
                  <td><span className="payment-badge">{sale.payment_method}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn danger" onClick={() => handleDeleteSale(sale.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <ShoppingCart size={48} color="#94a3b8" />
                    <h3>No sales found</h3>
                    <p>Start by recording your first sale</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>New Sale</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}

              {/* Customer Info */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Customer Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone (Optional)</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="+250 788 123 456"
                    />
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Add Items</h3>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Select Medicine *</label>
                    <select
                      value={selectedMedicine}
                      onChange={(e) => setSelectedMedicine(e.target.value)}
                    >
                      <option value="">Choose medicine...</option>
                      {inventory.map(med => (
                        <option key={med.id} value={med.id}>
                          {med.name} - RWF {med.price} (Stock: {med.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleAddToCart}
                      style={{ width: '100%' }}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Shopping Cart</h3>
                {cart.length > 0 ? (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%' }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Medicine</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Subtotal</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map(item => (
                          <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}><strong>{item.name}</strong></td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>RWF {item.price}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <button 
                                  className="icon-btn"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus size={14} />
                                </button>
                                <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                <button 
                                  className="icon-btn"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}><strong>RWF {item.subtotal.toFixed(2)}</strong></td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button 
                                className="icon-btn danger"
                                onClick={() => handleRemoveFromCart(item.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
                          <td colSpan="3" style={{ padding: '16px', textAlign: 'right' }}><strong>TOTAL:</strong></td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <strong style={{ fontSize: '20px', color: '#3b82f6' }}>RWF {calculateTotal()}</strong>
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '8px' }}>
                    Cart is empty. Add items above.
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {paymentMethod === 'Credit' && (
                <div className="alert-item" style={{ marginTop: '16px' }}>
                  ⚠️ This sale will be added to the customer's credit balance
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleSubmitSale}
                disabled={cart.length === 0 || !customerInfo.name}
              >
                Complete Sale - RWF {calculateTotal()}
              </button>
            </div>
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

export default Sales;
