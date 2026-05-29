# DishKit 

On-demand platform to order fresh pre-measured ingredients by dish, delivered in 30–90 minutes.

## Live Demo
- API: https://dishkit-backend.onrender.com/dishes
- Repo: https://github.com/rohitchennam/dishkit

## Tech Stack
| Layer | Tech |
|-------|------|
| Mobile | React Native (Expo) |
| Web | React.js |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon) |
| Hosting | Render |

## Project Structure
```text
dishkit/
├── backend/     # REST API
├── frontend/    # Customer web app
├── darkstore/   # Staff dashboard
└── mobile/      # Android app
```

## Quick Start

**Backend**
```bash
cd backend && npm install
# Add DATABASE_URL to .env
node setup.js && node seed.js
npm run dev
```

**Frontend / Darkstore**
```bash
cd frontend && npm install && npm start
cd darkstore && npm install && npm start
```

**Mobile**
```bash
cd mobile && npm install
# Set your backend URL in constants.js
npx expo start
```

## Features
- 10 dishes across 5 cuisines
- Multi-dish cart with serving size control
- Real-time dark store order board
- Ingredient packing checklist
- Order history with ingredient breakdown
- Android mobile app via Expo

## Roadmap
- [ ] Firebase Auth (Google + email + phone OTP)
- [ ] Admin analytics dashboard
- [ ] Delivery partner tracking
- [ ] AI dish recommendations
