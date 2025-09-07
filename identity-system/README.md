# Secure Identity Management System

Minimal UI, functionality-focused full-stack app.

## Features
- User registration/login with JWT
- RSA-hybrid file encryption (AES-256-GCM + RSA)
- Document upload/list/download/delete
- Digital ID with QR code
- Dashboard stats + recent activity
- Email notifications for expiring documents (cron daily)
- Simple admin endpoints (list users/docs, elevate user)

## Tech
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React (Vite)

## Project Structure
```
identity-system/
├── backend/
└── frontend/
```

## Setup
1) Backend
```
cd backend
cp .env.example .env
# edit .env values (MONGODB_URI, JWT_SECRET, SMTP_*)
npm install
npm run dev
```
Backend runs at http://localhost:5000

2) Frontend
```
cd ../frontend
npm install
echo 'VITE_API_BASE=http://localhost:5000/api' > .env
npm run dev
```
Frontend runs at http://localhost:5173

## API Overview
- POST /api/auth/register { name, email, password }
- POST /api/auth/login { email, password }
- GET /api/documents (Bearer)
- POST /api/documents/upload (form-data: file, expiryDate?) (Bearer)
- GET /api/documents/:id/download (Bearer)
- DELETE /api/documents/:id (Bearer)
- GET /api/digital-id (Bearer)
- GET /api/dashboard/stats (Bearer)
- Admin (Bearer admin):
  - GET /api/admin/users
  - GET /api/admin/documents
  - POST /api/admin/elevate { userId }

## Notes
- RSA keys auto-generated at first start under backend/src/keys
- For production, use a proper SMTP and strong JWT secret
- Multer uses memory storage; files are encrypted before writing to disk

