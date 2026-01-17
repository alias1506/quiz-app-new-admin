const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Apply authentication to all routes
router.use(isAuthenticated);

// @route   GET /api/users
// @desc    Get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().sort({ joinedOn: -1 }); // Newest first (matching old admin)

        // Calculate additional data for each user
        const usersWithData = users.map((user) => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let status = "Ready";
            let dailyAttempts = user.dailyAttempts || 0;

            if (user.lastAttemptDate) {
                const lastAttemptDay = new Date(
                    user.lastAttemptDate.getFullYear(),
                    user.lastAttemptDate.getMonth(),
                    user.lastAttemptDate.getDate()
                );

                if (lastAttemptDay.getTime() === today.getTime()) {
                    // Same day
                    if (dailyAttempts >= 3) {
                        status = "Limit Reached";
                    } else {
                        status = "Available";
                    }
                } else {
                    // Different day - reset
                    dailyAttempts = 0;
                    status = "Ready";
                }
            }

            // Get latest attempt info
            let score = user.score !== undefined ? user.score : 0;
            let total = user.total !== undefined ? user.total : 0;
            let attemptNumber = null;
            let timeTaken = null;

            if (user.attempts && user.attempts.length > 0) {
                const latestAttempt = user.attempts[user.attempts.length - 1];
                attemptNumber = latestAttempt.attemptNumber;
                score = latestAttempt.score !== undefined ? latestAttempt.score : score;
                total = latestAttempt.total !== undefined ? latestAttempt.total : total;
                timeTaken = latestAttempt.timeTaken !== undefined ? latestAttempt.timeTaken : null;
            }

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                joinedOn: user.joinedOn,
                score,
                total,
                attemptNumber,
                timeTaken,
                dailyAttempts,
                lastAttemptDate: user.lastAttemptDate,
                status,
            };
        });

        res.json(usersWithData);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// @route   GET /api/users/:id
// @desc    Get a single user by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Failed to fetch user" });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully",
            user: deleted,
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

// @route   POST /api/users/bulk-delete
// @desc    Delete multiple users
router.post("/bulk-delete", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No user IDs provided" });
        }

        const result = await User.deleteMany({ _id: { $in: ids } });

        res.json({
            message: `Deleted ${result.deletedCount} users`,
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        console.error("Error bulk deleting users:", err);
        res.status(500).json({ message: "Failed to delete users" });
    }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
router.get("/stats/summary", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const newUsersThisWeek = await User.countDocuments({
            joinedOn: { $gte: weekAgo },
        });

        res.json({
            totalUsers,
            newUsersThisWeek,
        });
    } catch (err) {
        console.error("Error fetching user stats:", err);
        res.status(500).json({ message: "Failed to fetch user statistics" });
    }
});

module.exports = router;
