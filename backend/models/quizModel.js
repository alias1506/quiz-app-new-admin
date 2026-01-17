const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        parts: {
            type: [String],
            default: [],
        },
    },
    {
        collection: "Quizzes",
        timestamps: true,
    }
);

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
