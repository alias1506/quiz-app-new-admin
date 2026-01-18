<div align="center">

# 🎓 Quiz Admin Dashboard

**Modern admin panel with AI-powered question generation and real-time WebSocket monitoring**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-FF6F00?style=flat-square)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [WebSocket](#-websocket-integration) • [AI Generation](#-ai-powered-features)

</div>

---

## 🚀 Quick Start

```bash
# Install dependencies
npm run install-all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Initialize admin account
cd backend && npm run init-admin

# Start application
cd .. && npm run dev
```

**Access:** Frontend: http://localhost:8080 • Backend: http://localhost:8000

**Default Login:** `admin@quiz.com` / `Admin@123`

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered
- Question generation via Groq AI
- Llama 3.3 70B model
- Bulk question creation
- Round descriptions
- Smart categorization

</td>
<td width="50%">

### 📊 Real-Time Monitoring
- Live user registration tracking
- Quiz attempt monitoring
- Instant score updates
- WebSocket dashboard
- No refresh required

</td>
</tr>
<tr>
<td>

### 📝 Quiz Management
- Multi-part quiz support
- Round-based organization
- Question sets management
- Bulk operations
- Publish/unpublish control

</td>
<td>

### 👥 User Management
- View all registered users
- Real-time attempt tracking
- Bulk delete operations
- User deletion with WebSocket
- Performance analytics

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

**Frontend** • React 19 • Vite 6.0 • CoreUI 5 • Chart.js • Socket.IO Client • Lucide Icons • Axios

**Backend** • Node.js 18+ • Express 4.18 • MongoDB 8.0 • Mongoose • Socket.IO 4.8 • Groq SDK • Express Session

---

## 🔄 WebSocket Integration

Real-time event broadcasting to all connected clients and user app.

**Admin Backend → All Clients**
```javascript
// Events emitted to admin frontends
✓ user:joined          // New user registration
✓ user:attemptStarted  // User started quiz
✓ user:scoreUpdated    // User completed quiz
✓ user:update          // User/quiz changes
```

**Admin Backend → User App**
```javascript
// Events emitted to student app
✓ user:update (quiz-updated)  // Quiz published/updated
✓ user:update (quiz-deleted)  // Quiz deleted
✓ user:update (deleted)       // User deleted
```

**Configuration**
```env
# Backend starts WebSocket server on port 8000
PORT=8000
```

See [WEBSOCKET_DATA_FLOWS.md](../WEBSOCKET_DATA_FLOWS.md) for complete documentation.

---

## ⚙️ Configuration

### Backend Environment (.env)

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/Quiz

# AI Integration
GROQ_API_KEY=gsk_your_groq_api_key_here

# Server
PORT=8000
NODE_ENV=development

# Security
SESSION_SECRET=your_random_session_secret_key

# Admin Credentials
ADMIN_EMAIL=admin@quiz.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin User

# CORS
FRONTEND_URL=http://localhost:8080
```

**Get Groq API Key:** https://console.groq.com → API Keys → Create (Free tier available)

**Get MongoDB URI:** https://cloud.mongodb.com → Create M0 Cluster (Free: 512MB) → Connect

---

## 📦 Installation

### Prerequisites
- Node.js 18+ & npm 9+
- MongoDB Atlas account
- Groq API key (optional, for AI features)

### Setup Steps

```bash
# 1. Install dependencies
npm run install-all

# 2. Create environment file
cp backend/.env.example backend/.env

# 3. Configure credentials in backend/.env
# Add MONGO_URI, GROQ_API_KEY, etc.

# 4. Initialize admin account
cd backend && npm run init-admin

# 5. Start application
cd .. && npm run dev
```

### Available Scripts

```bash
npm run dev              # Start both frontend & backend
npm run client           # Frontend only (port 8080)
npm run server           # Backend only (port 8000)
npm run install-all      # Install all dependencies
npm run build            # Build for production
```

**Backend Scripts:**
```bash
npm run init-admin       # Create/update admin account
npm run dev              # Development mode with nodemon
```

---

## 🤖 AI-Powered Features

### Question Generation

Generate quiz questions using Groq's Llama 3.3 70B model.

```javascript
// Example: Generate 10 questions on "Physics"
POST /api/questions/generate-ai
{
  "topic": "Physics",
  "count": 10,
  "difficulty": "medium",
  "targetSet": "Physics Set 1"
}
```

**Supported Topics:** Any subject or topic  
**Question Count:** 1-50 per request  
**Difficulty Levels:** easy, medium, hard  
**Rate Limits:** 30 requests/minute (free tier)

### Round Descriptions

Auto-generate round descriptions using AI.

```javascript
POST /api/rounds/generate-description
{
  "roundName": "Algebra Basics"
}
```

---

## 🚀 Deployment

**Render.com** (Recommended)

1. Create Web Service for backend
2. Create Static Site for frontend
3. Set environment variables
4. Connect MongoDB Atlas
5. Run `npm run init-admin` after first deploy

**Environment Variables:**
- Add all `.env` variables in Render dashboard
- Update `FRONTEND_URL` with production URL
- Update `MONGO_URI` with production database

---

## 🔐 Security

- Session-based authentication with bcrypt
- Password hashing with 10 salt rounds
- HTTP-only session cookies
- MongoDB session store
- CORS protection
- Environment variable security

**Change default credentials immediately after first login!**

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Admin login fails** | Run `npm run init-admin` in backend folder |
| **AI generation fails** | Check `GROQ_API_KEY` is valid and active |
| **MongoDB connection fails** | Whitelist IP (0.0.0.0/0) in Atlas |
| **CORS errors** | Verify `FRONTEND_URL` in backend .env |
| **WebSocket disconnects** | Check ports 8000 (backend) and 8080 (frontend) |
| **Port already in use** | Kill process: `npx kill-port 8000 8080` |

---

## 📄 License

MIT © 2026

---

<div align="center">

**Built with ❤️ using React, Node.js, MongoDB, Socket.IO, and Groq AI**

[Report Bug](../../issues) • [Request Feature](../../issues)

</div>
