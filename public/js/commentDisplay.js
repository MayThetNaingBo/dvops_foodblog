// Fetch and display post details
async function loadPostDetails(postId) {
    try {
        const response = await fetch(`/get-post/${postId}`);
        if (!response.ok) throw new Error("Post not found");

        const post = await response.json();
        document.getElementById("post-title").textContent = post.restaurantName;
        document.getElementById(
            "post-location"
        ).textContent = `Location: ${post.location}`;
        document.getElementById("post-content").textContent = post.content;
        document.getElementById("post-image").src = post.imageUrl;

        // Load comments for this post
        loadComments(postId);
    } catch (error) {
        console.error("Error loading post details:", error);
        document.getElementById("post-title").textContent = "Post not found";
    }
}

// Load comments for a post
async function loadComments(postId) {
    try {
        const response = await fetch(`/get-comments/${postId}`);
        const comments = await response.json();
        const commentsContainer = document.getElementById("comments-container");
        commentsContainer.innerHTML = "";

        comments.forEach((comment) => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.textContent = comment.text;
            commentsContainer.appendChild(commentDiv);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

// Add a new comment
async function addComment(postId) {
    const commentInput = document.getElementById("comment-input");
    const commentText = commentInput.value.trim();

    if (commentText === "") return;

    try {
        const response = await fetch(`/add-comment/${postId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: commentText }),
        });

        if (response.ok) {
            commentInput.value = ""; // Clear input field
            loadComments(postId); // Reload comments to show the new comment
        } else {
            console.error("Failed to add comment");
        }
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

// Initialize post details and comments on page load
document.addEventListener("DOMContentLoaded", () => {
    const postId = new URLSearchParams(window.location.search).get("id");
    if (postId) {
        loadPostDetails(postId);
        document
            .getElementById("add-comment-btn")
            .addEventListener("click", () => addComment(postId));
    } else {
        console.error("No post ID found in URL");
    }
});
