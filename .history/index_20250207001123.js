const Sentry = require("@sentry/node");
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const client = require("prom-client");
const statusMonitor = require("express-status-monitor");

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

// Sentry Initialization
Sentry.init({
    dsn: 'https://<your-public-key>@o<org-id>.ingest.sentry.io/<project-id>', // Replace with your actual DSN
    tracesSampleRate: 1.0, // Adjust the sample rate for performance monitoring
});

// Sentry middleware for request logging
app.use(Sentry.Handlers.requestHandler());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(statusMonitor());

// Prometheus Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

// Rate Limiting
const addPostRateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 3,
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

app.post("/autosave-draft", autosaveDraft);
app.get("/get-draft/:userId", fetchDraft);
app.post("/add-blogpost", addPostRateLimiter, addFeedback);
app.get("/get-feedback", getFeedback);
app.get("/get-feedback/:id", getFeedbackById);
app.put("/edit-feedback/:id", updateFeedback);
app.delete("/delete-feedback/:id", deleteFeedback);

// Sentry middleware for error logging
app.use(Sentry.Handlers.errorHandler());

// Server Initialization
const server = app.listen(PORT, async () => {
    await ensureFileExists(path.join(__dirname, "utils", "drafts.json"), "{}");
    await ensureFileExists(path.join(__dirname, "utils", "foodblogs.json"));
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app, server };
