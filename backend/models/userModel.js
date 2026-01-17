const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        joinedOn: {
            type: Date,
            default: Date.now,
        },
        attempts: {
            type: [
                {
                    attemptNumber: { type: Number, required: true },
                    timestamp: { type: Date, required: true },
                    score: { type: Number },
                    total: { type: Number },
                    timeTaken: { type: Number }, // in seconds
                    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
                },
            ],
            default: [],
        },
        dailyAttempts: {
            type: Number,
            default: 0,
        },
        lastAttemptDate: {
            type: Date,
            default: null,
        },
        // Legacy fields if needed during migration
        score: { type: Number },
        total: { type: Number },
    },
    {
        collection: "Users",
        strict: false,
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
