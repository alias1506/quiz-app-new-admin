const express = require("express");
const router = express.Router();
const Question = require("../models/questionModel");
const QuizSet = require("../models/setsModel");
const groqService = require("../services/groqService");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Apply authentication to all routes
router.use(isAuthenticated);

// @route   GET /api/questions
// @desc    Get all questions with set info
router.get("/", async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });

        // Optimization: Fetch all sets once and create a lookup map to avoid N+1 queries
        const allSets = await QuizSet.find();
        const setMap = new Map();
        allSets.forEach(set => {
            setMap.set(set.name, {
                _id: set._id,
                name: set.name,
                isActive: set.isActive,
            });
        });

        const populatedQuestions = questions.map(question => ({
            ...question.toObject(),
            set: setMap.get(question.set) || null
        }));

        res.json(populatedQuestions);
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ message: "Failed to fetch questions" });
    }
});

// @route   GET /api/questions/by-set/:setId
// @desc    Get questions by set ID
router.get("/by-set/:setId", async (req, res) => {
    try {
        const { setId } = req.params;
        const { includeInactive } = req.query;

        const targetSet = await QuizSet.findById(setId);
        if (!targetSet) {
            return res.status(404).json({ message: "Set not found" });
        }

        const questions = await Question.find({ set: targetSet.name }).sort({
            createdAt: -1,
        });

        if (!includeInactive || includeInactive === "false") {
            if (!targetSet.isActive) {
                return res.json([]);
            }
        }

        const populatedQuestions = questions.map((question) => ({
            ...question.toObject(),
            set: {
                _id: targetSet._id,
                name: targetSet.name,
                isActive: targetSet.isActive,
            },
        }));

        res.json(populatedQuestions);
    } catch (err) {
        console.error("Error fetching questions by set:", err);
        res.status(500).json({ message: "Failed to fetch questions by set" });
    }
});

// @route   POST /api/questions
// @desc    Add one or multiple questions
router.post("/", async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            // Bulk insert
            const questionsToSave = [];

            for (const q of req.body) {
                if (!q.question || !q.options || !q.correctAnswer || !q.set) {
                    return res.status(400).json({
                        message:
                            "Each question must include question, options, correctAnswer, and set",
                    });
                }

                if (!Array.isArray(q.options) || q.options.length < 2) {
                    return res.status(400).json({
                        message: "Each question must have at least two options",
                    });
                }

                if (!q.options.includes(q.correctAnswer)) {
                    return res.status(400).json({
                        message: "Correct answer must be one of the options",
                    });
                }

                // Convert set ID to set name if needed
                let setName = q.set;
                if (q.set.length === 24 && /^[0-9a-fA-F]{24}$/.test(q.set)) {
                    const foundSet = await QuizSet.findById(q.set);
                    if (!foundSet) {
                        return res.status(400).json({
                            message: `Set with ID "${q.set}" not found.`,
                        });
                    }
                    setName = foundSet.name;
                } else {
                    const foundSet = await QuizSet.findOne({ name: q.set });
                    if (!foundSet) {
                        return res.status(400).json({
                            message: `Set "${q.set}" not found. Please create the set first.`,
                        });
                    }
                }

                questionsToSave.push({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    set: setName,
                });
            }

            const saved = await Question.insertMany(questionsToSave, {
                ordered: false,
            });

            const populatedQuestions = [];
            for (const savedQuestion of saved) {
                const setInfo = await QuizSet.findOne({ name: savedQuestion.set });
                populatedQuestions.push({
                    ...savedQuestion.toObject(),
                    set: setInfo
                        ? {
                            _id: setInfo._id,
                            name: setInfo.name,
                            isActive: setInfo.isActive,
                        }
                        : null,
                });
            }

            return res.status(201).json({
                message: "Questions added",
                questions: populatedQuestions,
            });
        } else {
            // Single insert
            const { question, options, correctAnswer, set } = req.body;

            if (!question || !options || !correctAnswer || !set) {
                return res
                    .status(400)
                    .json({ message: "All fields (including set) are required" });
            }

            if (!Array.isArray(options) || options.length < 2) {
                return res
                    .status(400)
                    .json({ message: "At least two options are required" });
            }

            // Trim for robustness
            const trimmedOptions = options.map(opt => String(opt).trim());
            const trimmedCorrectAnswer = String(correctAnswer).trim();

            if (!trimmedOptions.includes(trimmedCorrectAnswer)) {
                return res
                    .status(400)
                    .json({ message: "Correct answer must match one of the options exactly (Case-sensitive, trimmed)" });
            }

            // Convert set ID to set name if needed
            let setName = set;
            if (set.length === 24 && /^[0-9a-fA-F]{24}$/.test(set)) {
                const foundSet = await QuizSet.findById(set);
                if (!foundSet) {
                    return res.status(400).json({
                        message: `Set with ID "${set}" not found.`,
                    });
                }
                setName = foundSet.name;
            } else {
                const foundSet = await QuizSet.findOne({ name: set });
                if (!foundSet) {
                    return res.status(400).json({
                        message: `Set "${set}" not found. Please create the set first.`,
                    });
                }
            }

            const newQuestion = new Question({
                question,
                options,
                correctAnswer,
                set: setName,
            });

            const saved = await newQuestion.save();

            const setInfo = await QuizSet.findOne({ name: saved.set });
            const populatedQuestion = {
                ...saved.toObject(),
                set: setInfo
                    ? {
                        _id: setInfo._id,
                        name: setInfo.name,
                        isActive: setInfo.isActive,
                    }
                    : null,
            };

            return res.status(201).json({
                message: "Question added",
                question: populatedQuestion,
            });
        }
    } catch (err) {
        console.error("Error saving question(s):", err);
        res
            .status(500)
            .json({ message: "Error saving question(s)", error: err.message });
    }
});

// @route   PUT /api/questions/:id
// @desc    Edit a question
router.put("/:id", async (req, res) => {
    const { question, options, correctAnswer, set } = req.body;

    if (!question || !options || !correctAnswer || !set) {
        return res
            .status(400)
            .json({ message: "All fields (including set) are required" });
    }

    if (!Array.isArray(options) || options.length < 2) {
        return res
            .status(400)
            .json({ message: "At least two options are required" });
    }

    // Trim for robustness
    const trimmedOptions = options.map(opt => String(opt).trim());
    const trimmedCorrectAnswer = String(correctAnswer).trim();

    if (!trimmedOptions.includes(trimmedCorrectAnswer)) {
        return res
            .status(400)
            .json({ message: "Correct answer must be one of the options (Check for extra spaces)" });
    }

    try {
        // Convert set ID to set name if needed
        let setName = set;
        if (set.length === 24 && /^[0-9a-fA-F]{24}$/.test(set)) {
            const foundSet = await QuizSet.findById(set);
            if (!foundSet) {
                return res.status(400).json({
                    message: `Set with ID "${set}" not found.`,
                });
            }
            setName = foundSet.name;
        } else {
            const foundSet = await QuizSet.findOne({ name: set });
            if (!foundSet) {
                return res.status(400).json({
                    message: `Set "${set}" not found.`,
                });
            }
        }

        const updated = await Question.findByIdAndUpdate(
            req.params.id,
            { question: question.trim(), options: trimmedOptions, correctAnswer: trimmedCorrectAnswer, set: setName },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Question not found" });
        }

        const setInfo = await QuizSet.findOne({ name: updated.set });
        const populatedQuestion = {
            ...updated.toObject(),
            set: setInfo
                ? {
                    _id: setInfo._id,
                    name: setInfo.name,
                    isActive: setInfo.isActive,
                }
                : null,
        };

        res.json({ message: "Question updated", question: populatedQuestion });
    } catch (err) {
        console.error("Error updating question:", err);
        res
            .status(500)
            .json({ message: "Error updating question", error: err.message });
    }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Question.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Question not found" });
        }

        const setInfo = await QuizSet.findOne({ name: deleted.set });
        const populatedQuestion = {
            ...deleted.toObject(),
            set: setInfo
                ? {
                    _id: setInfo._id,
                    name: setInfo.name,
                    isActive: setInfo.isActive,
                }
                : null,
        };

        res.json({ message: "Question deleted", question: populatedQuestion });
    } catch (err) {
        console.error("Error deleting question:", err);
        res
            .status(500)
            .json({ message: "Error deleting question", error: err.message });
    }
});

// @route   DELETE /api/questions/bulk
// @desc    Delete multiple questions
router.post("/bulk-delete", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No question IDs provided" });
        }

        const result = await Question.deleteMany({ _id: { $in: ids } });

        res.json({
            message: `Deleted ${result.deletedCount} questions`,
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        console.error("Error bulk deleting questions:", err);
        res
            .status(500)
            .json({ message: "Error deleting questions", error: err.message });
    }
});

// @route   POST /api/questions/generate-ai
// @desc    Generate questions using Groq AI
router.post("/generate-ai", async (req, res) => {
    try {
        const { keywords, setId, numQuestions } = req.body;


        if (!keywords || !setId || !numQuestions) {
            return res.status(400).json({
                message: "Keywords, setId, and numQuestions are required",
            });
        }

        const requestedCount = parseInt(numQuestions);
        if (isNaN(requestedCount) || requestedCount < 1 || requestedCount > 50) {
            return res.status(400).json({
                message: "numQuestions must be between 1 and 50",
            });
        }

        const targetSet = await QuizSet.findById(setId);
        if (!targetSet) {
            return res.status(404).json({ message: "Set not found" });
        }

        const existingQuestions = await Question.find({
            set: targetSet.name,
        }).select("question");

        const generatedQuestions = await groqService.generateQuestions(
            keywords,
            requestedCount,
            existingQuestions
        );

        // Filter out duplicates
        const existingQuestionsLower = existingQuestions.map((q) =>
            q.question.toLowerCase().trim()
        );
        const allGeneratedQuestionsLower = [];
        const uniqueQuestions = [];

        for (const q of generatedQuestions) {
            const questionLower = q.question.toLowerCase().trim();
            if (
                !existingQuestionsLower.includes(questionLower) &&
                !allGeneratedQuestionsLower.includes(questionLower)
            ) {
                uniqueQuestions.push(q);
                allGeneratedQuestionsLower.push(questionLower);
            }
        }

        // Ensure we only return the exact number of questions requested
        const limitedQuestions = uniqueQuestions.slice(0, requestedCount);

        const formattedQuestions = limitedQuestions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            set: targetSet.name,
            setId: targetSet._id,
            setInfo: {
                _id: targetSet._id,
                name: targetSet.name,
                isActive: targetSet.isActive,
            },
        }));

        res.json({
            success: true,
            questions: formattedQuestions,
            count: formattedQuestions.length,
            aiProvider: "Groq",
        });
    } catch (err) {
        console.error("Error generating questions:", err.message);
        res.status(500).json({
            message: "Failed to generate questions",
            error: err.message,
        });
    }
});

// @route   POST /api/questions/save-generated
// @desc    Save AI-generated questions
router.post("/save-generated", async (req, res) => {
    try {
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "No questions to save" });
        }

        // Sanitize questions to only include required fields
        const sanitizedQuestions = questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            set: q.set
        }));

        // Validate each question before saving
        for (const q of sanitizedQuestions) {
            if (!q.question || !q.options || !q.correctAnswer || !q.set) {
                return res.status(400).json({
                    message: "Each question must include question, options, correctAnswer, and set"
                });
            }
            if (!Array.isArray(q.options) || q.options.length < 2) {
                return res.status(400).json({
                    message: "Each question must have at least two options"
                });
            }
            if (!q.options.includes(q.correctAnswer)) {
                return res.status(400).json({
                    message: "Correct answer must be one of the options"
                });
            }
        }

        const savedQuestions = await Question.insertMany(sanitizedQuestions, {
            ordered: false
        });

        res.json({
            success: true,
            message: `Successfully saved ${savedQuestions.length} questions`,
            count: savedQuestions.length,
        });
    } catch (err) {
        console.error("❌ Error saving generated questions:", err);
        res.status(500).json({
            message: "Failed to save questions",
            error: err.message,
        });
    }
});

module.exports = router;
