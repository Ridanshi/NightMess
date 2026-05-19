<div align="center">

<h1>🌙 NightMess</h1>
<p><strong>A modern hostel canteen ordering & management platform</strong></p>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## Overview

NightMess is a full-stack canteen management platform designed for university hostels. It streamlines the entire food ordering workflow — from browsing menus and placing orders to real-time ETA updates and automatic wallet-based payments.

The platform supports **multiple messes** (canteens), each operating independently under a shared admin umbrella. Students use a **per-mess digital wallet** to pay instantly, vendors manage orders and menus in real time, and administrators oversee the entire ecosystem.

---

## Features

### For Students (Clients)
- Browse and filter menus by food type and category
- Add items to cart with live stock tracking
- Personalized food recommendations based on order history
- Per-mess digital wallet with recharge request flow
- Real-time order tracking with ETA updates
- Order cancellation with automatic refunds
- Email notifications for order acceptance, rejection, and readiness

### For Vendors (Mess Owners)
- Full menu management — add, edit, enable/disable items
- Accept or reject incoming orders with optional ETA
- Real-time order dashboard with pending/confirmed/ready states
- Approve or reject student wallet recharge requests
- Per-mess revenue and transaction tracking

### For Administrators
- Register and manage vendors and admins
- View all clients, vendors, and transaction records
- Platform-wide oversight and access control

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Bootstrap 5, Tailwind CSS, MUI |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Session | express-session with connect-mongo |
| Email | Resend (transactional emails) |
| File Upload | Multer |
| Icons | React Icons, Lucide React |

---

## Project Structure

```
nightmess/
├── backend/                  # Express API server
│   ├── public/
│   │   └── Images/           # Uploaded food item images
│   ├── index.js              # All routes, schemas, and server config
│   ├── recommended.py        # ML-based recommendation engine
│   ├── orders_data.csv       # Sample training data for recommendations
│   └── package.json
│
└── my_app/                   # React frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── admin/        # Admin dashboard components
    │   │   ├── vendor/       # Vendor dashboard components
    │   │   ├── client/       # Client (student) components
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   └── Footer.js
    │   ├── App.js            # Routes and context providers
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- [npm](https://www.npmjs.com/) v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/Ridanshi/NightMess.git
cd NightMess
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
npm run dev
```

The backend starts at **http://localhost:5000**

### 3. Set up the frontend

```bash
cd my_app
npm install
npm start
```

The frontend starts at **http://localhost:3000**

---

## Environment Variables

Create a `.env` file inside the `backend/` directory based on `.env.example`:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/nightMess

# Session secret — use a long random string in production
SESSION_SECRET=your_super_secret_session_key_here

# Resend API key for transactional emails
RESEND_API_KEY=re_your_resend_api_key_here

# Port (optional, defaults to 5000)
PORT=5000

# Frontend origin for CORS
CLIENT_ORIGIN=http://localhost:3000
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## API Overview

All endpoints are prefixed with `http://localhost:5000`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/check_login` | Login with email + password |
| `GET` | `/isUser` | Get current session user |
| `GET` | `/logout` | Destroy session |
| `POST` | `/change_pass` | Change password |

### Registration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register_admin` | Register admin |
| `POST` | `/register_client` | Register student |
| `POST` | `/register_vendors` | Register vendor |

### Food & Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/get_foods` | Get food items (filtered by selected mess) |
| `POST` | `/register_food` | Add food item (vendor) |
| `POST` | `/update_food_status` | Enable/disable food item |
| `POST` | `/update_food_quantity` | Update stock quantity |
| `POST` | `/addtocart` | Add item to cart |
| `GET` | `/show_cartdata` | Get current user's cart |
| `PUT` | `/update_cart_quantity` | Update item quantity in cart |
| `DELETE` | `/remove_from_cart/:id` | Remove item from cart |
| `DELETE` | `/clear_cart` | Clear entire cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/confirm_order` | Place order from cart |
| `GET` | `/show_orders` | Client's order history |
| `GET` | `/show_orders_vendor` | Vendor's incoming orders |
| `PUT` | `/confirm_order_status` | Accept order with optional ETA |
| `PUT` | `/reject_order_refund/:id` | Reject order + refund wallet |
| `PUT` | `/mark_order_ready/:id` | Mark order as ready for pickup |
| `POST` | `/set_order_time` | Update estimated time |
| `PUT` | `/cancel_order/:id` | Client cancels pending order |

### Wallet & Recharge

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/client_balance` | Get wallet balance for selected mess |
| `POST` | `/request_recharge` | Request wallet top-up |
| `GET` | `/get_recharge_requests` | Vendor views pending requests |
| `PUT` | `/approve_recharge/:id` | Vendor approves recharge |
| `PUT` | `/reject_recharge/:id` | Vendor rejects recharge |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/quick-recommendations` | Get personalized food suggestions |

---

## Roles & Access Control

```
Admin
  ├── Register/manage vendors and admins
  ├── View all clients
  └── Platform oversight

Vendor
  ├── Manage food menu (add/edit/toggle items)
  ├── Process incoming orders (accept/reject/ready)
  ├── Approve student wallet recharges
  └── View order history

Client (Student)
  ├── Browse mess menu
  ├── Add to cart and place orders
  ├── Track order status in real time
  └── Manage per-mess wallet balance
```

---

## Screenshots

> _Add screenshots of the following pages to showcase the UI:_
> - Student menu browsing page
> - Cart and checkout flow
> - Vendor order management dashboard
> - Admin panel
> - Wallet recharge flow

---

## Deployment

### Backend (Railway / Render / Fly.io)

1. Set all required environment variables in the platform dashboard.
2. Point `MONGODB_URI` to your MongoDB Atlas cluster.
3. Set `CLIENT_ORIGIN` to your deployed frontend URL.
4. Deploy from the `backend/` directory.

### Frontend (Vercel / Netlify)

1. Update the API base URL in the frontend to your deployed backend URL.
2. Deploy from the `my_app/` directory.
3. Set build command: `npm run build` and publish directory: `build`.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Future Scope

- [ ] Real-time order updates via WebSockets
- [ ] Mobile app (React Native)
- [ ] QR code-based order pickup
- [ ] Analytics dashboard for vendors
- [ ] Multi-campus support
- [ ] Payment gateway integration (Razorpay/UPI)
- [ ] Push notifications (PWA)
- [ ] Mess rating and review system

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Ridanshi**  
GitHub: [@Ridanshi](https://github.com/Ridanshi)

---

<div align="center">
<sub>Built for university hostels that deserve better than paper tokens and long queues.</sub>
</div>
