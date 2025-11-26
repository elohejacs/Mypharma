const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authMiddleware, (req, res) => {
  db.all(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
    [req.userId],
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }
      res.json(categories);
    }
  );
});

// Add new category
router.post('/', authMiddleware, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const id = 'CAT' + Date.now();

  db.run(
    'INSERT INTO categories (id, user_id, name) VALUES (?, ?, ?)',
    [id, req.userId, name],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add category' });
      }

      res.status(201).json({
        message: 'Category added successfully',
        category: { id, name }
      });
    }
  );
});

// Update category
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  db.run(
    'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
    [name, id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update category' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category updated successfully' });
    }
  );
});

// Delete category
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM categories WHERE id = ? AND user_id = ?',
    [id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete category' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully' });
    }
  );
});

module.exports = router;
