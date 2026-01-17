// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
    });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.adminId && req.session.role === "admin") {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Forbidden. Admin access required.",
    });
};

module.exports = { isAuthenticated, isAdmin };
