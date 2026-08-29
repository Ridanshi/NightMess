# NightMess

**Full-stack canteen ordering platform for university hostels**

---

## Overview

University hostel canteens typically run on paper tokens, verbal orders, and no real-time visibility. NightMess replaces that with a digital ordering system where students browse live menus, pay from a mess-specific wallet, and receive email notifications as their order moves from pending to confirmed to ready.

Three distinct roles interact with the platform: **students** who order food, **mess vendors** who manage menus and fulfill orders, and **administrators** who oversee the full ecosystem. Each role gets a purpose-built dashboard with the exact controls it needs.

---

## Core Features

**Student (Client)**
- Browse and filter the live menu of their selected mess by type and category
- Add items to cart with real-time stock enforcement; cart syncs against live inventory
- Per-mess digital wallet: separate balance for each canteen, topped up via a vendor-approved recharge flow
- Full order lifecycle tracking: Pending, Confirmed (with ETA), Ready for Pickup
- Cancel pending orders with automatic wallet refund
- Personalized food recommendations based on personal order history
- Email notifications on order acceptance, rejection, and readiness

**Vendor (Mess Owner)**
- Add and manage food items with image uploads; toggle availability without deleting items
- Incoming order dashboard: accept with optional ETA, reject with instant client refund, or mark ready
- Approve or reject student wallet recharge requests with full audit trail
- Per-item stock quantity management

**Admin**
- Register and manage vendor accounts and admin accounts
- View all clients and vendors across the platform
- Platform-level access control

---

## Engineering Highlights

**Role-based access control via session middleware**
All routes are guarded by server-side session checks (`req.session.isLoggedIn`, `req.session.usertype`). Role enforcement happens at the API layer, not just in the UI, so vendor and admin routes are inaccessible regardless of what the frontend sends.

**Per-mess wallet isolation**
Each client document stores an embedded `mess_wallets` array, one subdocument per vendor, each with its own balance. This models the real-world constraint where money paid to one mess cannot be used at another. Order payment uses a MongoDB `$elemMatch` and `$inc` update with an atomic balance check to prevent race conditions between concurrent order placements.

**Cart and inventory sync**
Adding to cart immediately decrements backend stock. Increasing cart quantity re-checks available stock. Removing an item or cancelling an order returns stock. This keeps the frontend display in sync with actual availability without a separate reservation system.

**Order state machine with ETA and refunds**
Orders move through discrete statuses: Pending to Confirmed to Ready, or Pending to Rejected. Rejection atomically refunds the order total back to the correct mess wallet. Vendor-set ETA is stored on the order and surfaced to the client in real time.

**Recharge approval workflow**
Students submit a recharge request for a specific mess; the vendor sees pending requests on their dashboard and approves or rejects. Approved requests atomically credit the correct mess wallet. This models a cash-to-digital flow without a payment gateway.

**Transactional email notifications**
Resend sends structured HTML emails on order confirmation (with ETA), rejection (with refund confirmation), and order ready events. Email failures are caught and logged without blocking the API response.

**Recommendation engine**
A Python-based collaborative filtering script (`backend/recommended.py`) processes historical order data to surface personalized food suggestions on the client home screen. The Node.js backend spawns this process and returns ranked results via a REST endpoint.

**State management**
Cart state and food data are managed through React Context (`CartContext`, `FoodContext`), scoped to authenticated sessions. Context updates propagate across the component tree without prop drilling, keeping the cart count and menu availability consistent across pages.

---

## Screenshots

> _Add screenshots here: student menu page, cart and checkout, vendor order dashboard, admin panel, and the wallet recharge flow._

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Bootstrap 5, Tailwind CSS, Material UI |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth / Sessions | express-session, connect-mongo |
| File Uploads | Multer |
| Email | Resend |
| Recommendations | Python (collaborative filtering) |

---

## Challenges & Learnings

**Atomic wallet operations**
The biggest design challenge was preventing a user from double-spending during concurrent requests. The solution was a single MongoDB update operation that combines the `$elemMatch` balance check and `$inc` decrement. If the balance is insufficient, the update modifies zero documents, which the API uses as a signal to reject the order without a separate read-then-write race.

**Cart state across two data layers**
The cart lives in MongoDB (persisted), but the food context lives in React state (ephemeral). Keeping them consistent, especially when another user buys the last item, required designing the backend to be the source of truth and having the frontend re-fetch inventory on every cart operation rather than managing optimistic local state.

**Session-based auth in a SPA context**
Cookie-based sessions with `httpOnly`, `sameSite: lax`, and CORS `credentials: true` required careful alignment between Express and the React fetch calls. Every protected API call explicitly sends `withCredentials: true`; misconfigurations here were a significant early debugging challenge.

**Multi-role routing**
Three roles share one frontend application. Route protection is layered: the backend rejects unauthorized API calls, and the frontend checks `/isUser` on mount to redirect unauthenticated or wrong-role users before rendering protected pages.

**Order number assignment**
Per-mess daily order numbers (1, 2, 3, restarting each day) are assigned at confirmation time. This required querying confirmed orders within a UTC day window for the same vendor, sorting by confirmation timestamp, and assigning the next sequential slot, with a fallback if the order wasn't found in the window.

---

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel / Netlify (static build) |
| Backend API | Railway / Render / Fly.io |
| Database | MongoDB Atlas |
| File Storage | Server filesystem (upgrade path: S3) |
| Email | Resend |

Environment variables are documented in [`backend/.env.example`](backend/.env.example). No secrets are committed to the repository.

---

## Local Setup

```bash
# Clone
git clone https://github.com/Ridanshi/NightMess.git && cd NightMess

# Backend
cd backend && npm install
cp .env.example .env   # fill in MONGODB_URI, SESSION_SECRET, RESEND_API_KEY
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd my_app && npm install
npm start              # http://localhost:3000
```

---

Built by [Ridanshi](https://github.com/Ridanshi)
