const express = require("express");
const router = express.Router();
const Admin = require("../models/adminModel");

// @route   POST /api/auth/login
// @desc    Admin login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Create session
        req.session.adminId = admin._id;
        req.session.email = admin.email;
        req.session.name = admin.name;
        req.session.role = admin.role;

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error saving session",
                });
            }
            res.json({
                success: true,
                message: "Login successful",
                admin: {
                    id: admin._id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                },
            });
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
});

// @route   POST /api/auth/register
// @desc    Register new admin (for initial setup)
router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists with this email",
            });
        }

        // Create new admin
        const admin = new Admin({
            email: email.toLowerCase(),
            password,
            name,
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout admin
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error logging out",
            });
        }

        res.clearCookie("connect.sid");
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    });
});

// @route   GET /api/auth/check
// @desc    Check if user is authenticated
router.get("/check", (req, res) => {
    if (req.session && req.session.adminId) {
        res.json({
            success: true,
            authenticated: true,
            admin: {
                id: req.session.adminId,
                email: req.session.email,
                name: req.session.name,
                role: req.session.role,
            },
        });
    } else {
        res.json({
            success: true,
            authenticated: false,
        });
    }
});

module.exports = router;
