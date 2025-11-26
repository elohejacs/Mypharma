console.log('📦 Loading database.js...');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'mypharma.db'));

const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pharmacy_name TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'pharmacist',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Suppliers table
    db.run(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Customers table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        credit REAL DEFAULT 0,
        total_purchases REAL DEFAULT 0,
        prescriptions INTEGER DEFAULT 0,
        last_visit DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Inventory table
    db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL,
        price REAL NOT NULL,
        expiry DATE NOT NULL,
        supplier TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Sales table
    db.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Create demo user
    const demoPassword = bcrypt.hashSync('password123', 10);
    db.run(`INSERT OR IGNORE INTO users (id, pharmacy_name, owner_name, email, phone, password, role)
      VALUES (1, 'Promephar Pharmacy', 'Jacob Ndayishimiye', 'elohe@mypharma.rw', '+250788123456', ?, 'pharmacist')
    `, [demoPassword]);

    // Insert demo categories
    const categories = [
      ['CAT001', 1, 'Pain Relief'],
      ['CAT002', 1, 'Antibiotics'],
      ['CAT003', 1, 'Supplements'],
      ['CAT004', 1, 'Allergy'],
      ['CAT005', 1, 'Vitamins']
    ];

    categories.forEach(category => {
      db.run(`
        INSERT OR IGNORE INTO categories (id, user_id, name)
        VALUES (?, ?, ?)
      `, category);
    });

    // Insert demo suppliers
    const suppliers = [
      ['SUP001', 1, 'PharmaCorp Ltd', 'John Manager', '+250788111222', 'contact@pharmacorp.rw'],
      ['SUP002', 1, 'MediSupply Inc', 'Sarah Director', '+250788222333', 'info@medisupply.rw'],
      ['SUP003', 1, 'HealthPlus Distributors', 'David Sales', '+250788333444', 'sales@healthplus.rw']
    ];

    suppliers.forEach(supplier => {
      db.run(`
        INSERT OR IGNORE INTO suppliers (id, user_id, name, contact, phone, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `, supplier);
    });

    // Insert demo customers
    const customers = [
      ['CUST001', 1, 'John Doe', '+250788123456', 'john.doe@email.com', 0, 1250.50, 3, '2025-11-10'],
      ['CUST002', 1, 'Jane Smith', '+250788123457', 'jane.smith@email.com', 150, 890.75, 2, '2025-11-09'],
      ['CUST003', 1, 'Mike Johnson', '+250788123458', 'mike.johnson@email.com', 0, 2340.25, 5, '2025-11-08']
    ];

    customers.forEach(customer => {
      db.run(`
        INSERT OR IGNORE INTO customers (id, user_id, name, phone, email, credit, total_purchases, prescriptions, last_visit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, customer);
    });

    // Insert demo inventory
    const inventory = [
      ['MED001', 1, 'Paracetamol 500mg', 'Pain Relief', 450, 2.50, '2026-06-15', 'PharmaCorp Ltd'],
      ['MED002', 1, 'Amoxicillin 250mg', 'Antibiotics', 230, 5.75, '2025-12-20', 'MediSupply Inc'],
      ['MED003', 1, 'Ibuprofen 400mg', 'Pain Relief', 180, 3.25, '2026-03-10', 'PharmaCorp Ltd'],
      ['MED004', 1, 'Vitamin C 1000mg', 'Supplements', 520, 4.00, '2026-09-05', 'HealthPlus Distributors'],
      ['MED005', 1, 'Cetirizine 10mg', 'Allergy', 95, 3.50, '2026-01-30', 'MediSupply Inc']
    ];

    inventory.forEach(item => {
      db.run(`
        INSERT OR IGNORE INTO inventory (id, user_id, name, category, stock, price, expiry, supplier)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, item);
    });

    // Insert demo sales
    const sales = [
      ['SALE001', 1, 'CUST001', 'John Doe', 'Paracetamol 500mg (2), Ibuprofen 400mg (1)', 8.25, 'Cash', '2025-11-10'],
      ['SALE002', 1, 'CUST002', 'Jane Smith', 'Amoxicillin 250mg (3)', 17.25, 'Credit', '2025-11-10'],
      ['SALE003', 1, 'CUST003', 'Mike Johnson', 'Vitamin C 1000mg (5), Cetirizine 10mg (2)', 27.00, 'Cash', '2025-11-09']
    ];

    sales.forEach(sale => {
      db.run(`
        INSERT OR IGNORE INTO sales (id, user_id, customer_id, customer_name, items, total, payment_method, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, sale);
    });
  });

  console.log('✅ Database initialized with demo data');
};

module.exports = { db, initDatabase };
