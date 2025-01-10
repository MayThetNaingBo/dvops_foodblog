const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const commentsFilePath = path.join(__dirname, "comments.json");

// Utility function to read JSON data from a file
async function readJSON(filename) {
    const data = await fs.readFile(filename, "utf8");
    return JSON.parse(data);
}

// Utility function to write JSON data to a file
async function writeJSON(filename, data) {
    await fs.writeFile(filename, JSON.stringify(data, null, 2), "utf8");
}

// Get detailed post by ID
async function getPostById(req, res) {
    const { id } = req.params;
    try {
        const posts = await readJSON(path.join(__dirname, "foodblogs.json"));
        const post = posts.find((p) => p.id === id);

        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: "Post not found" });
        }
    } catch (error) {
        console.error("Error retrieving post:", error);
        res.status(500).json({ message: "Error retrieving post" });
    }
}

// Get comments for a post by post ID
async function getComments(req, res) {
    const { id } = req.params;
    try {
        const comments = await readJSON(commentsFilePath);
        const postComments = comments[id] || [];
        res.json(postComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Error fetching comments" });
    }
}

// Add a new comment to a post by post ID
async function addComment(req, res) {
    const { id } = req.params; // Post ID
    const { text } = req.body; // Comment content

    try {
        const comments = await readJSON(commentsFilePath);
        if (!comments[id]) comments[id] = []; // Initialize array if no comments exist for this post
        const commentId = uuidv4(); // Generate a unique ID for the comment
        comments[id].push({ id: commentId, text }); // Add the new comment with ID
        await writeJSON(commentsFilePath, comments); // Save changes
        res.status(201).json({ message: "Comment added", id: commentId });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Error adding comment" });
    }
}

module.exports = {
    getPostById,
    getComments,
    addComment,
};
