const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        options: {
            type: [String], // Array of strings
            required: true,
            validate: {
                validator: (arr) => arr.length >= 2,
                message: "There must be at least two options",
            },
        },
        correctAnswer: {
            type: String,
            required: true,
            trim: true,
        },
        set: {
            type: String, // Store set name as string
            required: true,
            trim: true,
        },
    },
    {
        collection: "Questions", // Explicit collection name
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Add index for better query performance when filtering by set name
questionSchema.index({ set: 1 });

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
