const express = require("express");
const router = express.Router();
const Quiz = require("../models/quizModel");
const Round = require("../models/roundModel");
const { isAuthenticated } = require("../middleware/authMiddleware");
const socketService = require("../services/socketService");

// Apply authentication
router.use(isAuthenticated);

// Get all quizzes
router.get("/", async (req, res) => {
    try {
        const Quiz = require("../models/quizModel");
        const Question = require("../models/questionModel");

        const quizzes = await Quiz.find().sort({ createdAt: 1 });
        // Fetch rounds and populate sets for each quiz
        const quizzesWithDetails = await Promise.all(quizzes.map(async (q) => {
            const rounds = await Round.find({ quiz: q._id }).populate('selectedSets');

            // Add question count to each set
            const roundsWithCounts = await Promise.all(rounds.map(async (round) => {
                const setsWithCounts = await Promise.all(round.selectedSets.map(async (set) => {
                    const questionCount = await Question.countDocuments({ set: set.name });
                    return {
                        ...set.toObject(),
                        questionCount
                    };
                }));

                return {
                    ...round.toObject(),
                    sets: setsWithCounts
                };
            }));

            return { ...q.toObject(), rounds: roundsWithCounts, roundCount: rounds.length };
        }));
        res.json(quizzesWithDetails);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create quiz
router.post("/", async (req, res) => {
    try {
        if (req.body.isPublished) {
            return res.status(400).json({
                success: false,
                message: "Cannot publish a quiz with 0 rounds. Please create the quiz as a draft first and add rounds."
            });
        }
        const newQuiz = new Quiz(req.body);
        const saved = await newQuiz.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update quiz
router.put("/:id", async (req, res) => {
    try {
        if (req.body.isPublished) {
            const roundCount = await Round.countDocuments({ quiz: req.params.id });
            if (roundCount === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot publish a quiz with 0 rounds. Please add at least one round first."
                });
            }
        }
        const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Broadcast quiz update via WebSocket
        socketService.emitUserUpdate({
            action: 'quiz-updated',
            quizId: req.params.id,
            isPublished: updated.isPublished,
            quizName: updated.name
        });
        console.log("📢 Quiz update broadcasted via WebSocket");

        res.json(updated);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete quiz (and its rounds)
router.delete("/:id", async (req, res) => {
    try {
        await Round.deleteMany({ quiz: req.params.id });
        await Quiz.findByIdAndDelete(req.params.id);

        // Broadcast quiz deletion via WebSocket
        socketService.emitUserUpdate({
            action: 'quiz-deleted',
            quizId: req.params.id
        });
        console.log("📢 Quiz deletion broadcasted via WebSocket");

        res.json({ message: "Quiz and its rounds deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
