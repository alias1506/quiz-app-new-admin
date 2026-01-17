const mongoose = require("mongoose");

const setSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // Prevents duplicate set names
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        collection: "Sets",
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual field for question count
setSchema.virtual('questionCount', {
    ref: 'Question',
    localField: 'name',
    foreignField: 'set',
    count: true
});

// Add a pre-save middleware to ensure only one set can be active at a time
setSchema.pre("save", async function (next) {
    if (this.isActive && this.isModified("isActive")) {
        // If this set is being set to active, deactivate all other sets
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { isActive: false }
        );
    }
    next();
});

// Add an index on isActive for better query performance
setSchema.index({ isActive: 1 });

const QuizSet = mongoose.model("Set", setSchema);

module.exports = QuizSet;

