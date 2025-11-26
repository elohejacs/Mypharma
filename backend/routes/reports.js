const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, (req, res) => {
  const stats = {};

  // Total revenue
  db.get(
    'SELECT SUM(total) as totalRevenue FROM sales WHERE user_id = ?',
    [req.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to calculate revenue' });
      }
      stats.totalRevenue = result.totalRevenue || 0;

      // Total sales count
      db.get(
        'SELECT COUNT(*) as totalSales FROM sales WHERE user_id = ?',
        [req.userId],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to count sales' });
          }
          stats.totalSales = result.totalSales || 0;

          // Total products sold
          db.get(
            'SELECT SUM(stock) as totalProducts FROM inventory WHERE user_id = ?',
            [req.userId],
            (err, result) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to count products' });
              }
              stats.productsSold = result.totalProducts || 0;

              // Total customers
              db.get(
                'SELECT COUNT(*) as totalCustomers FROM customers WHERE user_id = ?',
                [req.userId],
                (err, result) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to count customers' });
                  }
                  stats.totalCustomers = result.totalCustomers || 0;

                  // Outstanding credit
                  db.get(
                    'SELECT SUM(credit) as outstandingCredit FROM customers WHERE user_id = ? AND credit > 0',
                    [req.userId],
                    (err, result) => {
                      if (err) {
                        return res.status(500).json({ error: 'Failed to calculate credit' });
                      }
                      stats.outstandingCredit = result.outstandingCredit || 0;

                      // Stock value
                      db.get(
                        'SELECT SUM(stock * price) as stockValue FROM inventory WHERE user_id = ?',
                        [req.userId],
                        (err, result) => {
                          if (err) {
                            return res.status(500).json({ error: 'Failed to calculate stock value' });
                          }
                          stats.stockValue = result.stockValue || 0;

                          res.json(stats);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Get top selling medicines
router.get('/top-medicines', authMiddleware, (req, res) => {
  db.all(
    `SELECT name, category, stock, price 
     FROM inventory 
     WHERE user_id = ? 
     ORDER BY stock DESC 
     LIMIT 10`,
    [req.userId],
    (err, medicines) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch top medicines' });
      }
      res.json(medicines);
    }
  );
});

// Get sales by category
router.get('/sales-by-category', authMiddleware, (req, res) => {
  db.all(
    `SELECT category, COUNT(*) as count, SUM(stock * price) as total
     FROM inventory
     WHERE user_id = ?
     GROUP BY category
     ORDER BY total DESC`,
    [req.userId],
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch category stats' });
      }
      res.json(categories);
    }
  );
});

// Get recent sales
router.get('/recent-sales', authMiddleware, (req, res) => {
  const limit = req.query.limit || 10;

  db.all(
    `SELECT * FROM sales 
     WHERE user_id = ? 
     ORDER BY date DESC, created_at DESC 
     LIMIT ?`,
    [req.userId, limit],
    (err, sales) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch recent sales' });
      }
      res.json(sales);
    }
  );
});

// Add this to the bottom of reports.js before module.exports

// Get monthly sales trends (last 6 months)
router.get('/monthly-sales', authMiddleware, (req, res) => {
  db.all(
    `SELECT 
      strftime('%Y-%m', date) as month,
      COUNT(*) as sales_count,
      SUM(total) as revenue
     FROM sales 
     WHERE user_id = ? 
       AND date >= date('now', '-6 months')
     GROUP BY strftime('%Y-%m', date)
     ORDER BY month ASC`,
    [req.userId],
    (err, monthlySales) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch monthly sales' });
      }
      res.json(monthlySales);
    }
  );
});

module.exports = router;

module.exports = router;