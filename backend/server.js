require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
    cors({
        origin: process.env.NODE_ENV === "production"
            ? process.env.FRONTEND_URL
            : "http://localhost:3000",
        credentials: true,
    })
);

const MongoStore = require("connect-mongo");

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        dbName: "Quiz",
    })
    .then(() => {
        console.log("✅ MongoDB connected to 'Quiz' database");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || "quiz_admin_secret_key",
        resave: false,
        saveUninitialized: false,
        store: (MongoStore.create ? MongoStore : MongoStore.default).create({
            mongoUrl: process.env.MONGO_URI,
            dbName: "Quiz",
            collectionName: "Sessions",
            ttl: 7 * 24 * 60 * 60, // 7 days
            autoRemove: "native",
        }),
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
    })
);

// Routes
const authRoutes = require("./routes/authRoute");
const questionRoutes = require("./routes/questionRoute");
const setsRoutes = require("./routes/setsRoute");
const userRoutes = require("./routes/userRoute");
const roundsRoutes = require("./routes/roundsRoute");
const quizRoutes = require("./routes/quizRoute");

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sets", setsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rounds", roundsRoutes);
app.use("/api/quizzes", quizRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Quiz Admin Backend is running",
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Quiz Admin Backend API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            questions: "/api/questions",
            sets: "/api/sets",
            users: "/api/users",
            health: "/api/health",
        },
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Quiz Admin Backend running on port ${PORT}`);
    console.log(`📍 API available at: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
