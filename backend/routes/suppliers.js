const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all suppliers
router.get('/', authMiddleware, (req, res) => {
  db.all(
    'SELECT * FROM suppliers WHERE user_id = ? ORDER BY name ASC',
    [req.userId],
    (err, suppliers) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch suppliers' });
      }
      res.json(suppliers);
    }
  );
});

// Add new supplier
router.post('/', authMiddleware, (req, res) => {
  const { name, contact, phone, email } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Supplier name is required' });
  }

  const id = 'SUP' + Date.now();

  db.run(
    'INSERT INTO suppliers (id, user_id, name, contact, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.userId, name, contact || '', phone || '', email || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add supplier' });
      }

      res.status(201).json({
        message: 'Supplier added successfully',
        supplier: { id, name, contact, phone, email }
      });
    }
  );
});

// Update supplier
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, contact, phone, email } = req.body;

  db.run(
    'UPDATE suppliers SET name = ?, contact = ?, phone = ?, email = ? WHERE id = ? AND user_id = ?',
    [name, contact, phone, email, id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update supplier' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      res.json({ message: 'Supplier updated successfully' });
    }
  );
});

// Delete supplier
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM suppliers WHERE id = ? AND user_id = ?',
    [id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete supplier' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      res.json({ message: 'Supplier deleted successfully' });
    }
  );
});

module.exports = router;
