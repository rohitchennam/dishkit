# DishKit 

A quick-commerce platform that lets users order fresh, pre-measured ingredients for a specific dish - delivered in 30–90 minutes. No meal planning, no grocery selection, no prep work.

> Select a dish → ingredients arrive at your door → you cook it.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/Web-React-61DAFB) ![Expo](https://img.shields.io/badge/Mobile-Expo-000020) ![Node.js](https://img.shields.io/badge/Backend-Node.js-339933) ![Express](https://img.shields.io/badge/API-Express-000000) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791) ![Render](https://img.shields.io/badge/Deploy-Render-46E3B7)

---

## What's in this repo

| Folder | What it is |
|---|---|
| `backend/` | Node.js + Express REST API |
| `frontend/` | Customer-facing React web app |
| `darkstore/` | Staff dashboard for order packing (React) |
| `mobile/` | Customer Android app (React Native + Expo) |

---

## Features

### Customer mobile app
- Browse dishes by cuisine, meal type, or search
- View ingredient list before ordering
- Multi-dish cart with per-dish serving selector
- Place orders with name and address
- Order confirmation with full ingredient breakdown
- Order history with expandable ingredient details
- Firebase email/password authentication

### Dark store staff dashboard
- Live order board (New → Packing → Ready → Out for delivery)
- Auto-refreshes every 5 seconds
- Per-order ingredient checklist - "Mark packed" locked until all items ticked
- Live timer showing how long since order was placed
- Turns red after 10 minutes (urgent)

### Backend API
- `GET /dishes` - list all active dishes
- `GET /dishes/:id` - dish detail with ingredients
- `POST /orders` - place a multi-dish order
- `GET /orders` - all orders with items and ingredients
- `GET /orders/:id` - single order detail
- `PATCH /orders/:id/status` - update order status

---

## Tech stack

**Frontend/Mobile**
- React Native (Expo SDK 56)
- React.js (web apps)
- Axios for API calls
- Firebase Auth (email/password)

**Backend**
- Node.js + Express
- PostgreSQL (Neon - cloud hosted)
- `pg` for database queries
- CORS + dotenv

**Deployment**
- Backend: [Render](https://render.com) (free tier)
- Database: [Neon](https://neon.tech) (free tier)
- Code: GitHub

---

## Database schema

```
users          - id, name, email, phone
dishes         - id, name, cuisine, meal_type, description, prep_time, cook_time, price
ingredients    - id, name, unit
dish_ingredients - dish_id, ingredient_id, quantity_per_serving
orders         - id, customer_name, address, status, total_amount
order_items    - order_id, dish_id, servings, price_at_order
```

---

## Running locally

### Prerequisites
- Node.js v18+
- PostgreSQL (local) or a Neon account
- Expo Go app on Android

### 1. Clone the repo
```bash
git clone https://github.com/rohitchennam/dishkit
cd dishkit
```

### 2. Backend
```bash
cd backend
npm install
```

Create `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dishkit
PORT=3000
```

```bash
node setup.js   # create tables
node seed.js    # add sample dishes
npm run dev     # start server
```

### 3. Customer web app
```bash
cd frontend
npm install
```

Create `.env`:
```
REACT_APP_API_URL=http://localhost:3000
```

```bash
npm start       # opens on localhost:3001
```

### 4. Dark store dashboard
```bash
cd darkstore
npm install
npm start       # opens on localhost:3002
```

### 5. Mobile app
```bash
cd mobile
npm install
```

Edit `constants.js`:
```js
export const API = 'http://YOUR_LOCAL_IP:3000'
```

```bash
npx expo start  # scan QR code with Expo Go
```

---

## Live demo

- Backend API: https://dishkit-backend.onrender.com/dishes
- GitHub: https://github.com/rohitchennam/dishkit

---

## Sample dishes included

| Dish | Cuisine | Price |
|---|---|---|
| Chicken Biryani | Indian | ₹249 |
| Paneer Butter Masala | Indian | ₹199 |
| Spaghetti Carbonara | Italian | ₹279 |
| Veg Hakka Noodles | Chinese | ₹149 |
| Chicken Hakka Noodles | Chinese | ₹179 |
| Dal Tadka | Indian | ₹129 |
| Kerala Fish Curry | Indian | ₹299 |
| Chicken Quesadilla | Mexican | ₹219 |
| Paneer Tikka | Indian | ₹189 |
| Avocado Egg Toast | Western | ₹159 |

---

## Roadmap

- [ ] Firebase phone OTP auth
- [ ] Google Sign-In
- [ ] Delivery partner app with live tracking
- [ ] Admin panel (dish/ingredient CRUD, analytics)
- [ ] AI dish recommendations based on order history
- [ ] Demand forecasting for inventory management
- [ ] Push notifications for order status updates

---

## Author

Rohit Chennam - [GitHub](https://github.com/rohitchennam)
