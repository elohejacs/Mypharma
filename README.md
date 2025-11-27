# MyPharma - Pharmacy Management System

A Full-stack web application for pharmacy management, featuring inventory tracking, sales processing, customer management, and business analytics.

🌐 **Live Demo:** [https://mypharma-orcin.vercel.app](https://mypharma-orcin.vercel.app)

---

## Author

**Jacob Ndayishimiye**  
Email: elohe@gmail.com  
Location: Kigali, Rwanda  

---

## 🎯 Overview

MyPharma is a complete solution that is designed to perform daily operations for small to medium-sized pharmacies. It provides real-time inventory tracking, sales processing, customer credit management, and detailed business reporting - all in one clear interface.

---

## ✨ Key Features

### 📦 Inventory Management
- **Medicine Tracking** - Inventory with name, category, stock, price, supplier
- **Expiry Date Monitoring** - Automatic alerts for medicines expiring within 2 months
- **Stock Validation** - Prevents adding expired or near-expiry medicines
- **Supplier Integration** - Select suppliers from pre-configured list 
- **Category Organization** - Organize medicines by categories (Pain Relief, Antibiotics, etc.)
- **Search & Filter** - Quick search across all inventory fields

### 💰 Sales Management
- **Shopping Cart System** - Add multiple items to cart with quantity adjustment
- **Real-time Stock Check** - Prevents overselling beyond available stock
- **Multiple Payment Methods** - Cash, Credit, Mobile Money, Card
- **Customer Information** - Capture customer details with each sale
- **Credit Sales Tracking** - Automatically tracks customer credit balances
- **Automatic Stock Update** - Inventory reduced automatically on sale completion

### 👥 Customer Management
- **Customer Database** - Store customer information, purchase history
- **Credit Tracking** - Separate view for customers with outstanding credit
- **Payment Recording** - Record partial or full credit payments
- **Purchase History** - Track total purchases and last visit date
- **Credit Alerts** - Dashboard warnings for outstanding credit

### 📊 Reports & Analytics
- **Business Summary** - Total revenue, sales count, customers, stock value
- **Top Selling Medicines** - Ranked list of best-performing products
- **Sales by Category** - Visual breakdown with percentages
- **Financial Metrics** - Daily/weekly averages, credit recovery rate
- **Export Functionality** - Reports available in PDF, Excel, and CSV format

### 🔐 Security & Admin
- **PIN Protection** - Settings section requires 4-digit PIN
- **User Authentication** - Secure login with JWT tokens
- **Role-Based Access** - Admin features protected
- **Data Validation** - All inputs validated before saving

---

## 🛠️ Technology Stack

### Frontend
- **jsPDF & jsPDF-AutoTable** - PDF generation
- **XLSX** - Excel export functionality
- **File-Saver** - File download handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Embedded database

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** SQLite (file-based)

---

## 🚀 Getting Started

### Prerequisites
```bash
- Node.js (v14 or higher)
- npm or yarn
- Git
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/elohejacs/mypharma.git
cd mypharma
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Setup Environment Variables**

Create `.env` file in backend folder:
```env
JWT_SECRET=mypharma_secret_key_change_in_production_2025
PORT=5000
NODE_ENV=development
```

5. **Initialize Database**
```bash
cd backend
node database.js
```

6. **Start Backend Server**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

7. **Start Frontend Development Server**
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

---

## 📱 Usage Guide

### First Time Setup

1. **Login with default credentials:**
   - Email: `elohe@mypharma.rw`
   - Password: `password123`

2. **Configure Settings (PIN: 1234):**
   - Add medicine categories
   - Add suppliers
   - Customize settings

3. **Add Inventory:**
   - Go to Inventory → Add Medicine
   - Fill in details, select category and supplier
   - System validates expiry dates automatically

4. **Process Sales:**
   - Go to Sales → New Sale
   - Enter customer info
   - Add items to cart
   - Select payment method
   - Complete sale

5. **Track Credit:**
   - Settings → Credit Customers
   - View outstanding balances
   - Record payments

6. **Generate Reports:**
   - Go to Reports
   - View analytics
   - Export to PDF/Excel/CSV

---

## 📂 Project Structure
```
mypharma/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── categories.js    # Category management
│   │   ├── customers.js     # Customer operations
│   │   ├── inventory.js     # Inventory management
│   │   ├── reports.js       # Analytics & reports
│   │   ├── sales.js         # Sales processing
│   │   └── suppliers.js     # Supplier management
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── database.js          # Database initialization
│   ├── server.js            # Express server setup
│   └── mypharma.db          # SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js    # Dashboard view
│   │   │   ├── Inventory.js    # Inventory management
│   │   │   ├── Sales.js        # Sales processing
│   │   │   ├── Reports.js      # Reports & analytics
│   │   │   ├── Settings.js     # Admin settings
│   │   │   ├── Login.js        # Login page
│   │   │   ├── Signup.js       # Registration page
│   │   │   └── Layout.js       # Main layout wrapper
│   │   ├── App.js              # Main app component
│   │   └── index.js            # Entry point
│   └── public/
│       └── index.html
│
└── README.md
```

---

## 🔑 Default Credentials

**Settings PIN:** `1234`

⚠️ **Important:** Change these credentials in production!

---

## 📊 Database Schema

### Users Table
- `id`, `pharmacy_name`, `owner_name`, `email`, `phone`, `password`, `role`, `settings_pin`

### Inventory Table
- `id`, `user_id`, `name`, `category`, `stock`, `price`, `expiry`, `supplier`

### Sales Table
- `id`, `user_id`, `customer_id`, `customer_name`, `items`, `total`, `payment_method`, `date`

### Customers Table
- `id`, `user_id`, `name`, `phone`, `email`, `credit`, `total_purchases`, `last_visit`

### Categories Table
- `id`, `user_id`, `name`

### Suppliers Table
- `id`, `user_id`, `name`, `contact`, `phone`, `email`

---

## 🔒 Security Features

- **Password Hashing:** Bcrypt encryption
- **PIN Protection:** Settings require 4-digit PIN
- **Input Validation:** All forms validated server-side

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/verify-pin` - Verify settings PIN

### Inventory
- `GET /api/inventory` - Get all medicines
- `POST /api/inventory` - Add medicine
- `PUT /api/inventory/:id` - Update medicine
- `DELETE /api/inventory/:id` - Delete medicine
- `GET /api/inventory/low-stock` - Get low stock items

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/range` - Get sales by date range

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/with-credit` - Get credit customers

### Reports
- `GET /api/reports/stats` - Get business statistics
- `GET /api/reports/top-medicines` - Top selling items
- `GET /api/reports/sales-by-category` - Category breakdown

### Categories & Suppliers
- `GET /api/categories` - Get categories
- `POST /api/categories` - Add category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- Similar endpoints for suppliers

---

## 📞 Support & Contact

**Developer:** Jacob Ndayishimiye  
**Email:** elohe@gmail.com  
**Live Demo:** [https://mypharma-orcin.vercel.app](https://mypharma-orcin.vercel.app)  
**GitHub:** [elohejacs]

---

*Jacob Ndayishimiye*
