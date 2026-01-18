const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Apply authentication to all routes
router.use(isAuthenticated);

// @route   GET /api/users
// @desc    Get all users - with separate rows for each quiz part
router.get("/", async (req, res) => {
    try {
        const users = await User.find().sort({ joinedOn: -1 });

        // Create separate entries for each quiz part the user has attempted
        const usersWithData = [];

        users.forEach((user) => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Group attempts by quiz part
            const attemptsByPart = {};

            if (user.attempts && user.attempts.length > 0) {
                user.attempts.forEach(attempt => {
                    const part = attempt.quizPart || 'N/A';
                    if (!attemptsByPart[part]) {
                        attemptsByPart[part] = [];
                    }
                    attemptsByPart[part].push(attempt);
                });
            } else {
                // If no attempts array, use the top-level quizPart
                const part = user.quizPart || 'N/A';
                attemptsByPart[part] = [];
            }

            // Create an entry for each part
            Object.keys(attemptsByPart).forEach(part => {
                const partAttempts = attemptsByPart[part];

                // Calculate daily attempts for this specific part
                const attemptsToday = partAttempts.filter(attempt => {
                    const attemptDate = new Date(attempt.timestamp);
                    const attemptDay = new Date(
                        attemptDate.getFullYear(),
                        attemptDate.getMonth(),
                        attemptDate.getDate()
                    );
                    return attemptDay.getTime() === today.getTime();
                });

                const dailyAttemptsForPart = attemptsToday.length;

                // Determine status for this part
                let status = "Ready";
                if (user.lastAttemptDate) {
                    const lastAttemptDay = new Date(
                        user.lastAttemptDate.getFullYear(),
                        user.lastAttemptDate.getMonth(),
                        user.lastAttemptDate.getDate()
                    );

                    if (lastAttemptDay.getTime() === today.getTime()) {
                        if (dailyAttemptsForPart >= 3) {
                            status = "Limit Reached";
                        } else {
                            status = "Available";
                        }
                    }
                }

                // Get latest attempt info for this part
                let score = 0;
                let total = 0;
                let attemptNumber = null;
                let timeTaken = null;
                let quizName = user.quizName || 'N/A';

                if (partAttempts.length > 0) {
                    const latestAttempt = partAttempts[partAttempts.length - 1];
                    attemptNumber = latestAttempt.attemptNumber;
                    score = latestAttempt.score !== undefined ? latestAttempt.score : 0;
                    total = latestAttempt.total !== undefined ? latestAttempt.total : 0;
                    timeTaken = latestAttempt.timeTaken !== undefined ? latestAttempt.timeTaken : null;
                    quizName = latestAttempt.quizName || user.quizName || 'N/A';
                }

                usersWithData.push({
                    _id: `${user._id}_${part}`, // Unique ID per user-part combination
                    userId: user._id, // Original user ID
                    name: user.name,
                    email: user.email,
                    joinedOn: user.joinedOn,
                    score,
                    total,
                    attemptNumber,
                    timeTaken,
                    dailyAttempts: dailyAttemptsForPart,
                    lastAttemptDate: user.lastAttemptDate,
                    quizName,
                    quizPart: part,
                    status,
                    roundTimings: partAttempts.length > 0 ? partAttempts[partAttempts.length - 1].roundTimings : []
                });
            });
        });

        res.json(usersWithData);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   POST /api/users
// @desc    Create a new user
router.post("/", async (req, res) => {
    try {
        const { name, email, quizName, quizPart } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const newUser = new User({
            name,
            email: email.toLowerCase().trim(),
            quizName: quizName || null,
            quizPart: quizPart || null,
            joinedOn: new Date(),
            dailyAttempts: 0,
            attempts: []
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
router.delete("/:id", async (req, res) => {
    try {
        // Extract the actual user ID (remove the part suffix if present)
        const idParam = req.params.id;
        const userId = idParam.includes('_') ? idParam.split('_')[0] : idParam;

        await User.findByIdAndDelete(userId);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   POST /api/users/bulk-delete
// @desc    Delete multiple users
router.post("/bulk-delete", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: "Invalid request" });
        }

        // Extract actual user IDs (remove part suffixes)
        const userIds = ids.map(id => id.includes('_') ? id.split('_')[0] : id);
        const uniqueUserIds = [...new Set(userIds)]; // Remove duplicates

        await User.deleteMany({ _id: { $in: uniqueUserIds } });
        res.json({ message: "Users deleted successfully" });
    } catch (err) {
        console.error("Error bulk deleting users:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
