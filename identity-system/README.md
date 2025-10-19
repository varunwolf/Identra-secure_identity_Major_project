# 🔐 Identra Identity System

A comprehensive and secure digital identity solution combining biometric authentication, RSA-encrypted document management, digital ID generation, and smart notifications — built for the future of trusted digital identity.

![Identra Banner](https://via.placeholder.com/800x200/1976d2/ffffff?text=Identra+Identity+System)

## ✨ Features

### 🔐 **Advanced Security**
- **Biometric Authentication** - Fingerprint and face recognition support
- **Two-Factor Authentication (2FA)** - Enhanced security with TOTP
- **RSA Encryption** - Military-grade encryption for all documents
- **Session Management** - Secure session handling with automatic timeout
- **Rate Limiting** - Protection against brute force attacks

### 📁 **Document Management**
- **Secure Upload** - Drag & drop file upload with encryption
- **Document Verification** - Automatic validation and expiry tracking
- **Smart Notifications** - Email alerts for expiring documents
- **File Types** - Support for PDF, DOC, DOCX, JPG, PNG
- **Search & Filter** - Advanced document search capabilities

### 🪪 **Digital Identity**
- **Digital ID Cards** - Auto-generated with QR codes
- **QR Code Generation** - Easy sharing and verification
- **Profile Management** - Comprehensive user profiles
- **Identity Verification** - Multi-level verification system

### 📊 **Analytics & Dashboard**
- **Real-time Dashboard** - Live statistics and activity feed
- **Document Analytics** - Expiry tracking and compliance monitoring
- **User Activity** - Comprehensive activity logging
- **Admin Panel** - Full administrative control

### 🎨 **Modern UI/UX**
- **Material-UI Design** - Beautiful, responsive interface
- **Dark/Light Theme** - User preference support
- **Mobile Responsive** - Works on all devices
- **Progressive Web App** - Installable on mobile devices
- **Real-time Updates** - WebSocket-powered live updates

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 5+ ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Identra/identity-system

# Run the automated setup script
./setup.sh
```

The setup script will:
- ✅ Check prerequisites
- ✅ Install all dependencies
- ✅ Create environment files
- ✅ Start MongoDB (if available)
- ✅ Launch the application

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
echo 'VITE_API_BASE=http://localhost:5000/api' > .env
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🏗️ Architecture

### Backend Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **RSA Encryption** - Document security
- **Nodemailer** - Email notifications
- **Helmet** - Security headers
- **Rate Limiting** - API protection

### Frontend Stack
- **React 19** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **React Hook Form** - Form handling

### Security Features
- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Data sanitization
- **RSA Encryption** - File encryption
- **JWT Tokens** - Secure authentication
- **Session Management** - Secure sessions

## 📱 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Document Endpoints
```http
GET    /api/documents
POST   /api/documents/upload
GET    /api/documents/:id/download
DELETE /api/documents/:id
```

### Digital ID Endpoints
```http
GET /api/digital-id
POST /api/digital-id/generate
```

### Dashboard Endpoints
```http
GET /api/dashboard/stats
GET /api/dashboard/activity
```

### Admin Endpoints
```http
GET  /api/admin/users
GET  /api/admin/documents
POST /api/admin/elevate
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/identra

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
NODE_ENV=development

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
VITE_API_BASE=http://localhost:5000/api
VITE_APP_NAME=Identra Identity System
VITE_WEBSOCKET_URL=ws://localhost:5000
```

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Session Management** - Secure session handling
- **Account Lockout** - Protection against brute force
- **Two-Factor Authentication** - TOTP-based 2FA

### Data Protection
- **RSA Encryption** - All documents encrypted at rest
- **HTTPS Ready** - SSL/TLS support
- **Input Validation** - Comprehensive data sanitization
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Content Security Policy

### Network Security
- **CORS Configuration** - Controlled cross-origin access
- **Rate Limiting** - API abuse prevention
- **Helmet.js** - Security headers
- **Request Validation** - Input sanitization

## 📊 Monitoring & Analytics

### Real-time Dashboard
- **Live Statistics** - Document counts, expiry alerts
- **Activity Feed** - Real-time user actions
- **Security Metrics** - Login attempts, failed authentications
- **Performance Monitoring** - Response times, error rates

### Admin Analytics
- **User Management** - User statistics and activity
- **Document Analytics** - Upload trends, expiry patterns
- **Security Monitoring** - Failed logins, suspicious activity
- **System Health** - Server status, database performance

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure email service
5. Set up monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone the repository
git clone <your-fork-url>
cd Identra/identity-system

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Admin Guide](docs/admin-guide.md)
- [Security Guide](docs/security.md)

### Getting Help
- 📧 Email: support@identra.com
- 💬 Discord: [Join our community](https://discord.gg/identra)
- 📖 Wiki: [GitHub Wiki](https://github.com/identra/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/identra/issues)

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Document management
- [x] Digital ID generation
- [x] Basic dashboard

### Phase 2: Advanced Features 🚧
- [ ] Biometric authentication
- [ ] Two-factor authentication
- [ ] Advanced analytics
- [ ] Mobile app

### Phase 3: Enterprise Features 📋
- [ ] Multi-tenant support
- [ ] Advanced admin panel
- [ ] API integrations
- [ ] Blockchain integration

## 🙏 Acknowledgments

- **Material-UI** - Beautiful React components
- **MongoDB** - Flexible database solution
- **Express.js** - Fast, unopinionated web framework
- **React** - A JavaScript library for building user interfaces
- **Socket.IO** - Real-time bidirectional event-based communication

---

<div align="center">

**🔐 Built with ❤️ for secure digital identity**

[Website](https://identra.com) • [Documentation](https://docs.identra.com) • [Support](https://support.identra.com)

</div>