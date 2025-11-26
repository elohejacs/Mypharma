const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', authMiddleware, (req, res) => {
  db.all(
    'SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, customers) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch customers' });
      }
      res.json(customers);
    }
  );
});

// Add new customer
router.post('/', authMiddleware, (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const id = 'CUST' + Date.now();
  const today = new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO customers (id, user_id, name, phone, email, credit, total_purchases, prescriptions, last_visit)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)`,
    [id, req.userId, name, phone, email || '', today],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add customer' });
      }

      res.status(201).json({
        message: 'Customer added successfully',
        customer: {
          id,
          name,
          phone,
          email,
          credit: 0,
          total_purchases: 0,
          prescriptions: 0,
          last_visit: today
        }
      });
    }
  );
});

// Update customer
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, phone, email, credit } = req.body;

  db.run(
    `UPDATE customers 
     SET name = ?, phone = ?, email = ?, credit = ?
     WHERE id = ? AND user_id = ?`,
    [name, phone, email, credit, id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update customer' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ message: 'Customer updated successfully' });
    }
  );
});

// Delete customer
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM customers WHERE id = ? AND user_id = ?',
    [id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete customer' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ message: 'Customer deleted successfully' });
    }
  );
});

// Get customers with credit
router.get('/with-credit', authMiddleware, (req, res) => {
  db.all(
    'SELECT * FROM customers WHERE user_id = ? AND credit > 0 ORDER BY credit DESC',
    [req.userId],
    (err, customers) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch customers with credit' });
      }
      res.json(customers);
    }
  );
});

module.exports = router;