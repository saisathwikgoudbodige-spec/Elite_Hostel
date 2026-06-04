# Hostel Fee Manager

A MERN-stack hostel fee management and student tracking application with owner and student portals.

## What is included

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, React Router v6, Tailwind CSS, Axios
- Student self-registration with pending approval
- Owner dashboard, room management, payments, expenses, reports, notifications, and settings
- Aadhaar encryption at rest with masked display
- JWT auth + bcrypt password hashing
- PDF / CSV export support (backend)

## Local setup

### Backend

1. Copy example env file:
   - `cd backend`
   - `copy .env.example .env`
2. Update `.env` values as needed.
3. Install dependencies:
   - `npm install`
4. Seed initial owner account and rooms:
   - `npm run seed`
5. Start backend server:
   - `npm run dev`

### Frontend

1. Copy example env file:
   - `cd frontend`
   - `copy .env.example .env`
2. Install dependencies:
   - `npm install`
3. Start development frontend:
   - `npm run dev`

### Default owner login after seeding

- Email: `admin@hostel.com`
- Password: `adminpassword`

## Deployment

### Frontend

- Deploy to Vercel using the `frontend` folder as the root.
- Set `VITE_API_BASE_URL` or `VITE_API_URL` in Vercel environment variables to your backend URL.

### Backend

- Deploy to Render, Heroku, or any Node.js host using `backend/server.js`.
- Set the env variables from `backend/.env.example`.
- Ensure `FRONTEND_URL` matches your frontend deployment URL.

### Database

- Use MongoDB Atlas and set `MONGO_URI` in backend environment variables.
- Create clusters with TLS enabled and whitelist your backend host.

## Notes

- The frontend supports `VITE_API_BASE_URL` and `VITE_API_URL` for API requests.
- The backend uses `FRONTEND_URL` for CORS.
- Student registration is available at `/register`.
- Owner login is at `/login` with `Owner / Admin` selected.
