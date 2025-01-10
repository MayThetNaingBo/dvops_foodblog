const fs = require("fs").promises;
const path = require("path");

const dataFilePath = path.join(__dirname, "foodblogs.json");

// Utility functions
async function ensureFileExists(filePath) {
    try {
        await fs.access(filePath);
    } catch (error) {
        await fs.writeFile(filePath, JSON.stringify([]), "utf8");
    }
}

async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        throw error;
    }
}

async function writeJSON(data, filePath) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing to JSON file:", error);
        throw error;
    }
}

// Get all feedback
async function getFeedback(req, res) {
    try {
        const feedbackData = await readJSON(dataFilePath);
        res.status(200).json(feedbackData);
    } catch (error) {
        console.error("Error fetching feedback data:", error);
        res.status(500).json({ message: "Unable to fetch feedback data." });
    }
}

// Get feedback by ID
async function getFeedbackById(req, res) {
    try {
        const { id } = req.params;
        const allPosts = await readJSON(dataFilePath);
        const feedback = allPosts.find((post) => post.id === id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Error fetching feedback." });
    }
}

// Update feedback by ID
async function updateFeedback(req, res) {
    try {
        const { id } = req.params;
        const {
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl,
        } = req.body;

        if (
            !restaurantName ||
            !location ||
            !visitDate ||
            !rating ||
            !content ||
            !imageUrl
        ) {
            return res
                .status(400)
                .json({ message: "All fields are required." });
        }

        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g;
        if (specialCharPattern.test(restaurantName)) {
            return res.status(400).json({
                message:
                    "Special characters cannot be included in the restaurant name.",
            });
        }
        if (specialCharPattern.test(location)) {
            return res.status(400).json({
                message:
                    "Special characters cannot be included in the location.",
            });
        }

        const wordCount = content.split(" ").filter(Boolean).length;
        if (wordCount < 5) {
            return res
                .status(400)
                .json({ message: "Feedback must be at least 5 words long." });
        }

        const imageUrlPattern = /\.(jpg|jpeg|png|gif)$/i;
        if (!imageUrlPattern.test(imageUrl)) {
            return res.status(400).json({
                message:
                    "Invalid image URL format. Must end with .jpg, .jpeg, .png, or .gif.",
            });
        }

        const allPosts = await readJSON(dataFilePath);
        const postIndex = allPosts.findIndex((post) => post.id === id);

        if (postIndex === -1) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        allPosts[postIndex] = {
            ...allPosts[postIndex],
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl,
        };
        await writeJSON(allPosts, dataFilePath);
        return res
            .status(200)
            .json({ message: "Feedback modified successfully!" });
    } catch (error) {
        console.error("Error updating feedback:", error);
        return res.status(500).json({ message: "Error updating feedback." });
    }
}

// Delete feedback by ID
async function deleteFeedback(req, res) {
    try {
        const { id } = req.params;
        const allPosts = await readJSON(dataFilePath);
        const filteredPosts = allPosts.filter((post) => post.id !== id);

        if (allPosts.length === filteredPosts.length) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        await writeJSON(filteredPosts, dataFilePath);
        return res
            .status(200)
            .json({ message: "Feedback deleted successfully!" });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        return res.status(500).json({ message: "Error deleting feedback." });
    }
}

module.exports = {
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
    getFeedback,
    ensureFileExists,
    readJSON,
    writeJSON,
};
