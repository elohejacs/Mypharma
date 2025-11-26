# MyPharma - Pharmacy Management System

A complete pharmacy management solution for small pharmacies in Rwanda and beyond.

## Features

- ✅ User Authentication (Login/Signup)
- ✅ Dashboard with Analytics
- ✅ Inventory Management (CRUD)
- ✅ Sales Management
- ✅ Customer Management
- ✅ Reports & Analytics
- ✅ Low Stock Alerts
- ✅ Credit Tracking

## Tech Stack

**Backend:**
- Node.js + Express
- SQLite Database
- JWT Authentication
- RESTful API

**Frontend:**
- React
- Axios for API calls
- Lucide React for icons
- CSS3 for styling

## Installation

### Backend Setup
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## Default Demo Login

- **Email:** demo@mypharma.rw
- **Password:** password123

Or create a new account via the signup page!

## Project Structure

```
mypharma/
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── inventory.js
│   │   ├── sales.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Inventory.js
│   │   │   ├── Sales.js
│   │   │   ├── Customers.js
│   │   │   ├── Reports.js
│   │   │   └── Layout.js
│   │   └── styles/
│   │       └── App.css
│   └── package.json
├── .env
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Create new account
- POST `/api/auth/signin` - Login
- GET `/api/auth/verify` - Verify token

### Inventory
- GET `/api/inventory` - Get all medicines
- POST `/api/inventory` - Add medicine
- PUT `/api/inventory/:id` - Update medicine
- DELETE `/api/inventory/:id` - Delete medicine

### Customers
- GET `/api/customers` - Get all customers
- POST `/api/customers` - Add customer
- PUT `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer

### Sales
- GET `/api/sales` - Get all sales
- POST `/api/sales` - Add sale
- DELETE `/api/sales/:id` - Delete sale

### Reports
- GET `/api/reports/stats` - Get dashboard statistics
- GET `/api/reports/top-medicines` - Get top selling medicines
- GET `/api/reports/sales-by-category` - Get sales by category

## Author

Jacob Ndayishimiye
African Leadership University
2025
