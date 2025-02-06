const Sentry = require("@sentry/node");
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const client = require("prom-client");
const statusMonitor = require("express-status-monitor");

const {
    ensureFileExists,
    autosaveDraft,
    fetchDraft,
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
    dsn: "https://051b32873a768e4571498794b53e2713@o4508773068177409.ingest.us.sentry.io/4508773082660864",
    tracesSampleRate: 1.0,
});

// Sentry middleware for request logging
app.use(Sentry.Handlers.errorHandler());
 // Updated

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
app.use(Sentry.Handlers.errorHandler);

// Server Initialization
const server = app.listen(PORT, async () => {
    const draftsFilePath = path.join(__dirname, "utils", "drafts.json");
    const dataFilePath = path.join(__dirname, "utils", "foodblogs.json");

    await ensureFileExists(draftsFilePath, "{}");
    await ensureFileExists(dataFilePath);

    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app, server };
