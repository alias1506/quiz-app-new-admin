const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        selectedSets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Set",
            },
        ],
        positivePoints: {
            type: Number,
            default: 10,
        },
        negativePoints: {
            type: Number,
            default: 5,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        assignedParts: {
            type: [String],
            default: [],
        },
        timer: {
            hours: { type: Number, default: 0 },
            minutes: { type: Number, default: 0 },
            seconds: { type: Number, default: 0 },
        },
    },
    {
        collection: "Rounds",
        timestamps: true,
    }
);

const Round = mongoose.model("Round", roundSchema);

module.exports = Round;
