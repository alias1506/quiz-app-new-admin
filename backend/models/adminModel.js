const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            default: "admin",
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        collection: "Admins",
        timestamps: true,
    }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
