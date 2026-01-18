/**
 * WebSocket Service for real-time communication
 * Handles broadcasting user events to connected admin clients
 */

let io = null;

const initializeSocket = (socketInstance) => {
    io = socketInstance;
    console.log("✅ Socket service initialized");
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};

// Emit events to all connected clients
const emitUserJoined = (userData) => {
    if (io) {
        io.emit("user:joined", userData);
        console.log("📢 Broadcasted: user:joined", userData.email);
    }
};

const emitAttemptStarted = (attemptData) => {
    if (io) {
        io.emit("user:attemptStarted", attemptData);
        console.log("📢 Broadcasted: user:attemptStarted", attemptData.email);
    }
};

const emitScoreUpdated = (scoreData) => {
    if (io) {
        io.emit("user:scoreUpdated", scoreData);
        console.log("📢 Broadcasted: user:scoreUpdated", scoreData.email);
    }
};

const emitUserUpdate = (data) => {
    if (io) {
        io.emit("user:update", data);
        console.log("📢 Broadcasted: user:update");
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitUserJoined,
    emitAttemptStarted,
    emitScoreUpdated,
    emitUserUpdate,
};
