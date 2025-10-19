# Identra Identity System

A secure digital identity solution combining biometric authentication, RSA-encrypted document management, digital ID generation, and notifications.

Repository: [https://github.com/BhuvanMM/Identra/tree/main/identity-system](https://github.com/BhuvanMM/Identra/tree/main/identity-system)

---

## Project Overview

Identra provides a secure platform for storing and managing personal documents, generating digital IDs with QR codes, and monitoring document validity. It focuses on strong security (encryption, JWT, rate limiting) and a responsive web interface.

## Features

### Security

* Biometric authentication (fingerprint and face recognition)
* Two-factor authentication (2FA)
* RSA encryption for documents
* Secure session management
* API rate limiting

### Document Management

* Secure upload with encryption
* Document verification and expiry tracking
* Email notifications for expiring documents
* Supported file types: PDF, DOC, DOCX, JPG, PNG
* Search and filter functionality

### Digital Identity

* Auto-generated digital ID cards with QR codes
* Profile management
* Multi-level identity verification

### Dashboard and Analytics

* Real-time dashboard
* Document expiry and compliance analytics
* User activity logs
* Admin panel with user and document management

## Quick Start

### Prerequisites

* Node.js 18+
* MongoDB 5+
* Git

### Automated Setup

```bash
git clone https://github.com/BhuvanMM/Identra.git
cd Identra/identity-system
./setup.sh
```

The setup script checks prerequisites, installs dependencies, creates environment files, starts MongoDB (if available), and launches the application.

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
echo 'VITE_API_BASE=http://localhost:5000/api' > .env
npm run dev
```

### Access

* Frontend: [http://localhost:5173](http://localhost:5173)
* API: [http://localhost:5000/api](http://localhost:5000/api)
* Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Architecture

### Backend

* Node.js, Express.js, MongoDB (Mongoose)
* Socket.IO for real-time updates
* JWT authentication
* RSA encryption for documents
* Nodemailer for emails
* Helmet and rate limiting for security

### Frontend

* React 19 with Material UI
* React Router and React Query
* Framer Motion for animations
* Axios for API requests
* Socket.IO client for real-time data

## API Overview

### Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Documents

```
GET    /api/documents
POST   /api/documents/upload
GET    /api/documents/:id/download
DELETE /api/documents/:id
```

### Digital ID

```
GET  /api/digital-id
POST /api/digital-id/generate
```

### Dashboard

```
GET /api/dashboard/stats
GET /api/dashboard/activity
```

### Admin

```
GET  /api/admin/users
GET  /api/admin/documents
POST /api/admin/elevate
```

## Configuration

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/identra
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_BASE=http://localhost:5000/api
VITE_APP_NAME=Identra Identity System
VITE_WEBSOCKET_URL=ws://localhost:5000
```

## Deployment

### Docker

```bash
docker-compose up -d
```

### Production

```bash
npm run build
npm start
```

Set `NODE_ENV=production`, configure the production database, SSL, and email service before deploying.

## License

This project is licensed under the MIT License. See LICENSE for details.

## Support

* Issues: [https://github.com/BhuvanMM/Identra/issues](https://github.com/BhuvanMM/Identra/issues)
* Documentation: docs/ directory in the repository
