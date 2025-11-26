const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { pharmacyName, ownerName, email, phone, password } = req.body;

  // Validation
  if (!pharmacyName || !ownerName || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.run(
        `INSERT INTO users (pharmacy_name, owner_name, email, phone, password, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pharmacyName, ownerName, email, phone, hashedPassword, 'pharmacist'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create account' });
          }

          // Generate token
          const token = jwt.sign(
            { userId: this.lastID, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
              id: this.lastID,
              pharmacyName,
              ownerName,
              email,
              phone
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Sign in
router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        pharmacyName: user.pharmacy_name,
        ownerName: user.owner_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  });
});

// Verify token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({
        user: {
          id: user.id,
          pharmacyName: user.pharmacy_name,
          ownerName: user.owner_name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Verify settings PIN
router.post('/verify-pin', (req, res) => {
  const { pin } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.get('SELECT settings_pin FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      if (user.settings_pin === pin) {
        res.json({ success: true, message: 'PIN verified' });
      } else {
        res.status(401).json({ error: 'Invalid PIN' });
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;