# ProductVault — Full-Stack Product Management App

A full-stack React + Node.js application with JWT authentication and protected routes.

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs  
**Frontend:** React 18, React Router v6, Vite, Context API

---

## Project Structure

```
project/
├── backend/          # Express REST API
│   ├── app.js
│   ├── .env
│   └── src/
│       ├── config/db.js
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/
│       ├── models/
│       └── utils/
│
└── frontend/         # React SPA
    └── src/
        ├── components/ProtectedRoute.jsx
        ├── context/AuthContext.jsx
        ├── pages/
        ├── services/api.js
        ├── App.jsx
        └── main.jsx
```

---

## Setup & Run

### Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm run dev   # runs on http://localhost:5010
# Optional: seed sample products for the existing user
npm run seed
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | Endpoint        | Description       | Auth Required |
|--------|----------------|-------------------|---------------|
| POST   | /auth/register  | Register user     | No            |
| POST   | /auth/login     | Login user        | No            |
| GET    | /auth/me        | Get current user  | Yes           |

### Products
| Method | Endpoint          | Description       | Auth Required |
|--------|------------------|-------------------|---------------|
| GET    | /products         | Get all products  | Yes           |
| POST   | /products         | Create product    | Yes           |
| GET    | /products/:id     | Get one product   | Yes           |
| PUT    | /products/:id     | Update product    | Yes           |
| DELETE | /products/:id     | Delete product    | Yes           |

---

## Features

- JWT authentication stored in localStorage
- Protected routes redirect to /login if unauthenticated
- Auth state persists on page refresh via localStorage
- Token expiry handled — user redirected to login
- Full CRUD for products
- Search/filter products by name or category
- Stock level badges (in stock / low / out of stock)
- Responsive design

---

## Deployment

**Backend → Railway / Render:**
- Set `MONGO_URI`, `JWT_SECRET`, `PORT` as environment variables
- Deploy from GitHub

**Frontend → Vercel / Netlify:**
- Set `VITE_API_URL` to your deployed backend URL
- Build command: `npm run build`
- Publish directory: `dist`
