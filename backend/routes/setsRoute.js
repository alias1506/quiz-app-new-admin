const express = require("express");
const router = express.Router();
const QuizSet = require("../models/setsModel");
const Question = require("../models/questionModel");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Apply authentication to all routes
router.use(isAuthenticated);

// @route   GET /api/sets
// @desc    Get all sets with question count
router.get("/", async (req, res) => {
    try {
        const sets = await QuizSet.find().sort({ createdAt: 1 });

        // Add question count for each set
        const setsWithCount = await Promise.all(
            sets.map(async (set) => {
                const questionCount = await Question.countDocuments({
                    set: set.name,
                });
                return {
                    ...set.toObject(),
                    questionCount,
                };
            })
        );

        res.json(setsWithCount);
    } catch (err) {
        console.error("Error fetching sets:", err);
        res.status(500).json({ message: "Failed to fetch sets" });
    }
});

// @route   GET /api/sets/:id
// @desc    Get a single set by ID
router.get("/:id", async (req, res) => {
    try {
        const set = await QuizSet.findById(req.params.id);

        if (!set) {
            return res.status(404).json({ message: "Set not found" });
        }

        const questionCount = await Question.countDocuments({ set: set.name });

        res.json({
            ...set.toObject(),
            questionCount,
        });
    } catch (err) {
        console.error("Error fetching set:", err);
        res.status(500).json({ message: "Failed to fetch set" });
    }
});

// @route   POST /api/sets
// @desc    Create a new set
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Set name is required" });
        }

        // Check if set already exists
        const existingSet = await QuizSet.findOne({ name: name.trim() });
        if (existingSet) {
            return res
                .status(400)
                .json({ message: "A set with this name already exists" });
        }

        const newSet = new QuizSet({
            name: name.trim(),
            isActive: false,
        });

        const saved = await newSet.save();

        res.status(201).json({
            message: "Set created successfully",
            set: {
                ...saved.toObject(),
                questionCount: 0,
            },
        });
    } catch (err) {
        console.error("Error creating set:", err);
        res.status(500).json({ message: "Failed to create set" });
    }
});

// @route   PUT /api/sets/:id
// @desc    Update a set
router.put("/:id", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Set name is required" });
        }

        // Check if another set with this name exists
        const existingSet = await QuizSet.findOne({
            name: name.trim(),
            _id: { $ne: req.params.id },
        });

        if (existingSet) {
            return res
                .status(400)
                .json({ message: "A set with this name already exists" });
        }

        const oldSet = await QuizSet.findById(req.params.id);
        if (!oldSet) {
            return res.status(404).json({ message: "Set not found" });
        }

        const oldName = oldSet.name;
        oldSet.name = name.trim();
        const updated = await oldSet.save();

        // Update all questions with the old set name
        if (oldName !== name.trim()) {
            await Question.updateMany({ set: oldName }, { set: name.trim() });
        }

        const questionCount = await Question.countDocuments({ set: updated.name });

        res.json({
            message: "Set updated successfully",
            set: {
                ...updated.toObject(),
                questionCount,
            },
        });
    } catch (err) {
        console.error("Error updating set:", err);
        res.status(500).json({ message: "Failed to update set" });
    }
});

// @route   PUT /api/sets/:id/toggle-active
// @desc    Toggle set active status
router.put("/:id/toggle-active", async (req, res) => {
    try {
        const set = await QuizSet.findById(req.params.id);

        if (!set) {
            return res.status(404).json({ message: "Set not found" });
        }

        // Check if set has enough questions (minimum 6)
        const questionCount = await Question.countDocuments({ set: set.name });

        if (!set.isActive && questionCount < 6) {
            return res.status(400).json({
                message: "Cannot activate set with less than 6 questions",
                questionCount,
            });
        }

        set.isActive = !set.isActive;
        const updated = await set.save();

        res.json({
            message: `Set ${updated.isActive ? "activated" : "deactivated"}`,
            set: {
                ...updated.toObject(),
                questionCount,
            },
        });
    } catch (err) {
        console.error("Error toggling set status:", err);
        res.status(500).json({ message: "Failed to toggle set status" });
    }
});

// @route   DELETE /api/sets/:id
// @desc    Delete a set and all its questions
router.delete("/:id", async (req, res) => {
    try {
        const set = await QuizSet.findById(req.params.id);

        if (!set) {
            return res.status(404).json({ message: "Set not found" });
        }

        // Delete all questions in this set
        const deleteResult = await Question.deleteMany({ set: set.name });

        // Delete the set
        await QuizSet.findByIdAndDelete(req.params.id);

        res.json({
            message: "Set and associated questions deleted",
            deletedQuestions: deleteResult.deletedCount,
        });
    } catch (err) {
        console.error("Error deleting set:", err);
        res.status(500).json({ message: "Failed to delete set" });
    }
});

// @route   POST /api/sets/bulk-delete
// @desc    Delete multiple sets
router.post("/bulk-delete", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No set IDs provided" });
        }

        // Get all sets to delete
        const sets = await QuizSet.find({ _id: { $in: ids } });
        const setNames = sets.map((s) => s.name);

        // Delete all questions in these sets
        const questionDeleteResult = await Question.deleteMany({
            set: { $in: setNames },
        });

        // Delete the sets
        const setDeleteResult = await QuizSet.deleteMany({ _id: { $in: ids } });

        res.json({
            message: `Deleted ${setDeleteResult.deletedCount} sets and ${questionDeleteResult.deletedCount} questions`,
            deletedSets: setDeleteResult.deletedCount,
            deletedQuestions: questionDeleteResult.deletedCount,
        });
    } catch (err) {
        console.error("Error bulk deleting sets:", err);
        res.status(500).json({ message: "Failed to delete sets" });
    }
});

module.exports = router;
