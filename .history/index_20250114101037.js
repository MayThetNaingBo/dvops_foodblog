const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");

// Import utilities
const {
    ensureFileExists,
    autosaveDraft,
    fetchDraft,
    saveDraftToFile,
    getDraftFromFile,
    addFeedback,
} = require("./utils/FoodblogUtil");

const {
    getFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
} = require("./utils/UpdateDeleteFeedbackUtil");

const app = express();
const PORT = 5050;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const statusMonitor = require("express-status-monitor");
app.use(statusMonitor());
// File paths
const draftsFilePath = path.join(__dirname, "utils", "drafts.json");
const dataFilePath = path.join(__dirname, "utils", "foodblogs.json");

// Rate Limiting for adding blog posts
const addPostRateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes window
    max: 10000, // Limit each user to 3 requests per 3 minutes
    message: {
        success: false,
        message:
            "You have exceeded the maximum limit of 3 posts within 3 minutes. Please wait before posting again.",
    },
});

// Routes
app.get("/", (req, res) => {
    res.send("Server is running");
});

// Draft Management Routes
app.post("/autosave-draft", autosaveDraft); // Autosave a draft
app.get("/get-draft/:userId", fetchDraft); // Fetch a saved draft by userId

// Feedback Management Routes
app.post("/add-blogpost", addPostRateLimiter, addFeedback); // Add new feedback
app.get("/get-feedback", getFeedback); // Get all feedback
app.get("/get-feedback/:id", getFeedbackById); // Get feedback by ID
app.put("/edit-feedback/:id", updateFeedback); // Edit feedback by ID
app.delete("/delete-feedback/:id", deleteFeedback); // Delete feedback by ID

// Server Initialization
const server = app.listen(PORT, async () => {
    await ensureFileExists(draftsFilePath, "{}");
    await ensureFileExists(dataFilePath);
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app, server };
