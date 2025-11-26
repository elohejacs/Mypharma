const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all inventory items
router.get('/', authMiddleware, (req, res) => {
  db.all(
    'SELECT * FROM inventory WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch inventory' });
      }
      res.json(items);
    }
  );
});

// Add new medicine
router.post('/', authMiddleware, (req, res) => {
  const { name, category, stock, price, expiry, supplier } = req.body;

  if (!name || !category || !stock || !price || !expiry || !supplier) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const id = 'MED' + Date.now();

  db.run(
    `INSERT INTO inventory (id, user_id, name, category, stock, price, expiry, supplier)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.userId, name, category, stock, price, expiry, supplier],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add medicine' });
      }

      res.status(201).json({
        message: 'Medicine added successfully',
        medicine: {
          id,
          name,
          category,
          stock,
          price,
          expiry,
          supplier
        }
      });
    }
  );
});

// Update medicine
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, category, stock, price, expiry, supplier } = req.body;

  db.run(
    `UPDATE inventory 
     SET name = ?, category = ?, stock = ?, price = ?, expiry = ?, supplier = ?
     WHERE id = ? AND user_id = ?`,
    [name, category, stock, price, expiry, supplier, id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update medicine' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Medicine not found' });
      }

      res.json({ message: 'Medicine updated successfully' });
    }
  );
});

// Delete medicine
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM inventory WHERE id = ? AND user_id = ?',
    [id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete medicine' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Medicine not found' });
      }

      res.json({ message: 'Medicine deleted successfully' });
    }
  );
});

// Get low stock items
router.get('/low-stock', authMiddleware, (req, res) => {
  const threshold = req.query.threshold || 150;

  db.all(
    'SELECT * FROM inventory WHERE user_id = ? AND stock < ? ORDER BY stock ASC',
    [req.userId, threshold],
    (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch low stock items' });
      }
      res.json(items);
    }
  );
});

module.exports = router;