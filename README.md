# Quiz Admin Panel

> Modern admin dashboard for quiz management with AI-powered question generation

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Quick Start

```bash
# Install dependencies
npm run install-all

# Configure environment (see below)
cp backend/.env.example backend/.env

# Initialize admin account
cd backend && npm run init-admin

# Start application
cd .. && npm start
```

**Access Points:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## Environment Configuration

Create `backend/.env` with the following variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string_here

# AI Integration
GROQ_API_KEY=gsk_your_groq_api_key_here

# Server
PORT=5000
NODE_ENV=development

# Security
SESSION_SECRET=your_random_session_secret_key

# Default Admin Credentials
ADMIN_EMAIL=admin@quiz.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin User
```

> **Note:** Change admin credentials immediately after first login

---

## Features

- **AI-Powered Questions** — Generate quiz questions using Groq AI (Llama 3.3 70B)
- **Round Management** — Organize quizzes into conceptual rounds with multiple parts
- **Bulk Operations** — Efficiently manage large datasets
- **Real-time Analytics** — Monitor quiz performance and user engagement
- **Secure Authentication** — Session-based auth with bcrypt password hashing
- **Responsive Design** — Modern UI built with CoreUI and Lucide icons

---

## Tech Stack

**Frontend**
- React 19 + Vite
- CoreUI 5
- Chart.js
- Axios

**Backend**
- Express.js 4
- MongoDB + Mongoose
- Groq SDK
- Express Session

---

## Project Structure

```
quiz-app-new-admin/
├── frontend/          # React application
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── views/         # Page components
│       └── services/      # API integration
├── backend/           # Express server
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   └── middleware/    # Auth & validation
└── package.json       # Monorepo scripts
```

---

## Available Scripts

```bash
npm start              # Run frontend + backend concurrently
npm run client         # Frontend only (port 3000)
npm run server         # Backend only (port 5000)
npm run install-all    # Install all dependencies
```

**Backend scripts:**
```bash
npm run init-admin     # Create admin account
npm run dev            # Development mode with nodemon
```

---

## Default Admin Access

After running `npm run init-admin`, use these credentials:

- **Email:** `admin@quiz.com`
- **Password:** `Admin@123`

⚠️ **Security:** Update credentials in `.env` before initialization or change them after first login

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin authentication |
| GET | `/api/questions` | Fetch all questions |
| POST | `/api/questions` | Create question |
| GET | `/api/rounds` | Fetch all rounds |
| POST | `/api/quiz` | Create new quiz |

---

## Troubleshooting

**Admin Login Fails**
- Verify `npm run init-admin` was executed
- Check `MONGO_URI` points to correct database

**AI Generation Fails**
- Validate `GROQ_API_KEY` is active
- Check rate limits (30 req/min on free tier)

**CORS Issues**
- Frontend must run on `http://localhost:3000`
- Update `server.js` CORS config if needed

---

## License

MIT © 2026

**Version:** 1.2.0