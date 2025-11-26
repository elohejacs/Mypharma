const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all sales
router.get('/', authMiddleware, (req, res) => {
  db.all(
    'SELECT * FROM sales WHERE user_id = ? ORDER BY date DESC, created_at DESC',
    [req.userId],
    (err, sales) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch sales' });
      }
      res.json(sales);
    }
  );
});

// Add new sale
router.post('/', authMiddleware, (req, res) => {
  const { customer_id, customer_name, items, total, payment_method } = req.body;

  if (!customer_id || !customer_name || !items || !total || !payment_method) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const id = 'SALE' + Date.now();
  const today = new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO sales (id, user_id, customer_id, customer_name, items, total, payment_method, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.userId, customer_id, customer_name, items, total, payment_method, today],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add sale' });
      }

      // Update customer last visit and total purchases
      db.run(
        `UPDATE customers 
         SET last_visit = ?, total_purchases = total_purchases + ?
         WHERE id = ? AND user_id = ?`,
        [today, total, customer_id, req.userId]
      );

      // If credit payment, update customer credit
      if (payment_method === 'Credit') {
        db.run(
          `UPDATE customers 
           SET credit = credit + ?
           WHERE id = ? AND user_id = ?`,
          [total, customer_id, req.userId]
        );
      }

      res.status(201).json({
        message: 'Sale added successfully',
        sale: {
          id,
          customer_id,
          customer_name,
          items,
          total,
          payment_method,
          date: today
        }
      });
    }
  );
});

// Delete sale
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM sales WHERE id = ? AND user_id = ?',
    [id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete sale' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      res.json({ message: 'Sale deleted successfully' });
    }
  );
});

// Get sales by date range
router.get('/range', authMiddleware, (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end dates are required' });
  }

  db.all(
    'SELECT * FROM sales WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
    [req.userId, start, end],
    (err, sales) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch sales' });
      }
      res.json(sales);
    }
  );
});

module.exports = router;