const express = require("express");
const router = express.Router();
const Round = require("../models/roundModel");
const groqService = require("../services/groqService");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Apply authentication to all routes
router.use(isAuthenticated);

// Get all rounds
router.get("/", async (req, res) => {
    try {
        const rounds = await Round.find().populate("selectedSets").sort({ createdAt: 1 });
        res.json(rounds);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get round by ID
router.get("/:id", async (req, res) => {
    try {
        const round = await Round.findById(req.params.id).populate("selectedSets");
        if (!round) return res.status(404).json({ success: false, message: "Round not found" });
        res.json(round);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create round
router.post("/", async (req, res) => {
    try {
        const newRound = new Round(req.body);
        const savedRound = await newRound.save();
        res.status(201).json(savedRound);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update round
router.put("/:id", async (req, res) => {
    try {
        const updatedRound = await Round.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRound) return res.status(404).json({ success: false, message: "Round not found" });
        res.json(updatedRound);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Toggle publish status
router.put("/:id/publish", async (req, res) => {
    try {
        const round = await Round.findById(req.params.id);
        if (!round) return res.status(404).json({ success: false, message: "Round not found" });

        round.isPublished = !round.isPublished;
        await round.save();

        res.json(round);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete round
router.delete("/:id", async (req, res) => {
    try {
        const deletedRound = await Round.findByIdAndDelete(req.params.id);
        if (!deletedRound) return res.status(404).json({ success: false, message: "Round not found" });

        // Check if this quiz has any remaining rounds
        const quizId = deletedRound.quiz;
        if (quizId) {
            const remainingRounds = await Round.countDocuments({ quiz: quizId });

            // If no rounds left, unpublish the quiz silently
            if (remainingRounds === 0) {
                const Quiz = require("../models/quizModel");
                const quiz = await Quiz.findById(quizId);

                if (quiz && quiz.isPublished) {
                    quiz.isPublished = false;
                    await quiz.save();
                }
            }
        }

        res.json({ message: "Round deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get rounds by quiz ID
router.get("/by-quiz/:quizId", async (req, res) => {
    try {
        const rounds = await Round.find({ quiz: req.params.quizId })
            .populate("selectedSets")
            .sort({ createdAt: 1 });
        res.json(rounds);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// AI Generate Description
router.post("/generate-description", async (req, res) => {
    try {
        const { roundName } = req.body;
        if (!roundName) {
            return res.status(400).json({ success: false, message: "Round name is required" });
        }

        const description = await groqService.generateDescription(roundName);
        res.json({ success: true, description });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
