require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const socketService = require("./services/socketService");

const app = express();

// Trust proxy for secure cookies on Render
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
    cors({
        origin: process.env.NODE_ENV === "production"
            ? process.env.FRONTEND_URL
            : "http://localhost:8080",
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
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
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


// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    app.get("*", (req, res) => {
        // If it's an API route that's not found, send 404
        if (req.originalUrl.startsWith("/api")) {
            return res.status(404).json({
                success: false,
                message: "API Route not found",
            });
        }
        res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
    });
} else {
    // 404 handler for development
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

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: "Route not found",
        });
    });
}

// Start server with Socket.IO support
const PORT = process.env.PORT || 8000;
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? [process.env.FRONTEND_URL, process.env.USER_APP_URL]
            : ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Listen for user events from the student backend
    socket.on("user:joined", (data) => {
        console.log("👤 User joined event received:", data);
        // Broadcast to all admin clients
        io.emit("user:joined", data);
        io.emit("user:update", data);
    });

    socket.on("user:attemptStarted", (data) => {
        console.log("▶️ Attempt started event received:", data);
        // Broadcast to all admin clients
        io.emit("user:attemptStarted", data);
        io.emit("user:update", data);
    });

    socket.on("user:scoreUpdated", (data) => {
        console.log("📊 Score updated event received:", data);
        // Broadcast to all admin clients
        io.emit("user:scoreUpdated", data);
        io.emit("user:update", data);
    });
});

// Initialize socket service
socketService.initializeSocket(io);

// Make io accessible in routes
app.set("io", io);

server.listen(PORT, () => {
    console.log(`🚀 Quiz Admin Backend running on port ${PORT}`);
    console.log(`📍 API available at: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server running`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = { app, io, server };
