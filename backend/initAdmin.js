require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/adminModel");

async function initializeAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Quiz",
        });
        console.log("✅ Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            email: process.env.ADMIN_EMAIL || "admin@quiz.com",
        });

        if (existingAdmin) {
            console.log("ℹ️  Admin user already exists");
            console.log(`📧 Email: ${existingAdmin.email}`);
            process.exit(0);
        }

        // Create default admin
        const admin = new Admin({
            email: process.env.ADMIN_EMAIL || "admin@quiz.com",
            password: process.env.ADMIN_PASSWORD || "admin123",
            name: process.env.ADMIN_NAME || "Admin User",
            role: "admin",
        });

        await admin.save();

        console.log("✅ Default admin created successfully!");
        console.log("📧 Email:", process.env.ADMIN_EMAIL || "admin@quiz.com");
        console.log("🔑 Password:", process.env.ADMIN_PASSWORD || "admin123");
        console.log("\n⚠️  Please change the password after first login!");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error initializing admin:", error);
        process.exit(1);
    }
}

initializeAdmin();
