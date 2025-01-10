const fs = require("fs").promises;
const path = require("path");

const draftsFilePath = path.join(__dirname, "drafts.json");
const dataFilePath = path.join(__dirname, "foodblogs.json");

// Banned words list
const bannedWords = ["awful", "kill", "terrible", "stupid"];

function containsBannedWords(content) {
    return bannedWords.some((word) =>
        content.toLowerCase().includes(word.toLowerCase())
    );
}

// Ensure the file exists or create it
async function ensureFileExists(filePath, initialContent = "[]") {
    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, initialContent, "utf8");
    }
}

// Utility functions for JSON operations
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf8");
        console.log("File read successfully:", data);
        return JSON.parse(data || "{}"); // Return an empty object if file is empty
    } catch (error) {
        console.error("Error reading file:", error);
        if (error.code === "ENOENT") {
            // File doesn't exist, create it
            await fs.writeFile(filePath, "{}", "utf8");
            console.log("File created:", filePath);
            return {};
        }
        throw error;
    }
}

async function writeJSON(data, filePath) {
    try {
        const allData = await readJSON(filePath);
        allData.push(data);
        await fs.writeFile(filePath, JSON.stringify(allData, null, 2), "utf8");
        return allData;
    } catch (err) {
        console.error("Error writing to JSON file:", err);
        throw err;
    }
}

// Draft management
async function saveDraftToFile(userId, draftData) {
    try {
        const drafts = await readJSON(draftsFilePath);
        console.log("Current drafts before saving:", drafts);

        // Update drafts object
        drafts[userId] = draftData;

        // Log the updated drafts before writing
        console.log("Updated drafts:", drafts);

        // Write to the file and confirm success
        await fs.writeFile(
            draftsFilePath,
            JSON.stringify(drafts, null, 2),
            "utf8"
        );
        console.log("Drafts successfully written to file.");
    } catch (error) {
        console.error("Error saving draft to file:", error);
        throw error;
    }
}

async function getDraftFromFile(userId) {
    const drafts = await readJSON(draftsFilePath);
    return drafts[userId];
}

// Feedback management
async function addFeedback(req, res) {
    try {
        let { restaurantName, location, visitDate, rating, content, imageUrl } =
            req.body;

        // Check for inappropriate content
        if (containsBannedWords(content)) {
            return res
                .status(400)
                .send("Validation error: Inappropriate content.");
        }

        // Set a default image if not provided
        const urlPattern = /^(https?:\/\/)/i;
        imageUrl =
            imageUrl && urlPattern.test(imageUrl)
                ? imageUrl
                : "images/NoImage.jpg";

        const newFeedback = {
            id: Date.now().toString(),
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl,
        };

        const updatedFeedback = await writeJSON(newFeedback, dataFilePath);
        return res.status(201).json({ success: true, data: updatedFeedback });
    } catch (error) {
        console.error("Error adding feedback:", error);
        return res.status(500).send("Server error: Unable to add feedback.");
    }
}

// Draft Routes
async function autosaveDraft(req, res) {
    try {
        const { userId, ...draftData } = req.body;
        console.log("Received auto-save request:", { userId, draftData });

        await saveDraftToFile(userId, draftData);

        console.log("Draft successfully saved.");
        res.status(200).json({
            success: true,
            message: "Draft autosaved successfully.",
        });
    } catch (error) {
        console.error("Error autosaving draft:", error);
        res.status(500).json({
            success: false,
            message: "Error autosaving draft.",
        });
    }
}

async function fetchDraft(req, res) {
    try {
        const draft = await getDraftFromFile(req.params.userId);
        if (draft) {
            res.status(200).json({ success: true, draft });
        } else {
            res.status(404).json({
                success: false,
                message: "No draft found.",
            });
        }
    } catch (error) {
        console.error("Error fetching draft:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching draft.",
        });
    }
}

module.exports = {
    ensureFileExists,
    saveDraftToFile,
    getDraftFromFile,
    addFeedback,
    autosaveDraft,
    fetchDraft,
};
