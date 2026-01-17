# 🎓 Quiz Admin Panel

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq-orange?logo=probot&logoColor=white)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional, feature-rich admin dashboard for managing quiz questions, conceptual rounds, and multi-part structures with AI-powered question generation.

---

## 🚀 Quick Start

### 1. Install Dependencies
Initialize both frontend and backend dependencies using the root installer:
```bash
npm run install-all
```

### 2. Configure Environment
Create a `.env` file in the `backend/` directory (see [Environment Setup](#-environment-setup) below).

### 3. Initialize Admin
Create your primary admin account using the built-in script:
```bash
cd backend
npm run init-admin
```

### 4. Run Application
Start both the React development server and the Express backend simultaneously:
```bash
npm start
```
- **Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## ✨ Key Features

- **🎯 Round & Part Management**: Create complex quiz structures with conceptual rounds (e.g., Round 1) divided into multiple parts (e.g., Physics, Chemistry).
- **🤖 AI Question Generation**: Seamless integration with **Groq AI** (Llama 3.3 70B) for ultra-fast, context-aware question creation.
- **📊 Real-time Analytics**: Monitor quiz status, round distribution, and user performance at a glance.
- **🔐 Secure Auth**: Robust admin authentication with session-based security and bcrypt hashing.
- **🛠️ Bulk Operations**: Efficiently manage large datasets with bulk delete and multi-set assignments.
- **📱 Responsive Design**: Premium UI built with **CoreUI** and **Lucide Icons** for a smooth experience on all devices.

---

## 📁 Project Structure

```text
quiz-app-new-admin/
├── frontend/             # React Application (Vite + CoreUI)
│   ├── src/
│   │   ├── components/   # Reusable UI elements
│   │   ├── services/     # API integration layer
│   │   └── views/        # Dashboard, Quiz & Round management
│   └── package.json
├── backend/              # Node.js Express Server
│   ├── models/           # Mongoose Data Models
│   ├── routes/           # API Endpoint controllers
│   ├── services/         # Business logic (Groq AI, etc.)
│   └── .env              # Server configurations
├── package.json          # Monorepo management scripts
└── README.md             # Documentation
```

---

## ⚙️ Environment Setup

### Backend Configuration (`backend/.env`)

```env
# Database Connection
MONGO_URI=mongodb+srv://<db_user>:<db_password>@cluster.mongodb.net/Quiz?retryWrites=true&w=majority

# Groq AI API Key (Get from https://console.groq.com/keys)
GROQ_API_KEY=gsk_your_free_api_key_here

# Server Settings
PORT=5000
NODE_ENV=development

# Security
SESSION_SECRET=your_long_random_secret_string

# Default Admin (Used during npm run init-admin)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password_here
ADMIN_NAME=Admin User
```

---

## 🏗️ Tech Stack

### Frontend
- **React 19** & **Vite**
- **CoreUI** (Enterprise-grade UI Kit)
- **Lucide React** (Modern Iconography)
- **Chart.js** (Data Visualization)
- **Axios** (API Requests)

### Backend
- **Express.js** & **Node.js**
- **MongoDB** (NoSQL Database)
- **Mongoose** (ODM)
- **Groq SDK** (AI Question Engine)
- **Express Session** (Authentication)

---

## 🆘 Troubleshooting

- **Admin Login Fails**: Ensure you have run `npm run init-admin` and that your `MONGO_URI` is correctly pointing to the "Quiz" database.
- **AI Not Generating**: Check your `GROQ_API_KEY` status and ensure you haven't exceeded the free-tier rate limits (30 requests/min).
- **CORS Errors**: The backend is configured to accept requests from `http://localhost:3000` by default. Update `server.js` if running on a different port.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

**Status**: ✅ Production Ready
**Version**: 1.2.0
**Last Updated**: January 2026