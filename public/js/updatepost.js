// Retrieve and populate form data on update.html page load
document.addEventListener("DOMContentLoaded", () => {
    const feedbackData = JSON.parse(localStorage.getItem("feedbackToUpdate"));
    if (feedbackData) {
        document.getElementById("restaurantName").value =
            feedbackData.restaurantName || "";
        document.getElementById("location").value = feedbackData.location || "";
        document.getElementById("visitDate").value =
            feedbackData.visitDate || "";
        document.getElementById("rating").value = feedbackData.rating || "";
        document.getElementById("content").value = feedbackData.content || "";
        document.getElementById("imageFile").value =
            feedbackData.imageUrl || "";
        localStorage.setItem("feedbackIdToUpdate", feedbackData.id);
    } else {
        console.error("No feedback data found in localStorage.");
    }
});

// Update feedback function with validation
function updateFeedback() {
    // Get form elements
    const restaurantName = document
        .getElementById("restaurantName")
        .value.trim();
    const location = document.getElementById("location").value.trim();
    const visitDate = document.getElementById("visitDate").value;
    const rating = document.getElementById("rating").value;
    const content = document.getElementById("content").value.trim();
    const imageUrl = document.getElementById("imageFile").value.trim();

    // Validate required fields
    if (
        !restaurantName ||
        !location ||
        !visitDate ||
        !rating ||
        !content ||
        !imageUrl
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    // Validate rating (1-5 range)
    if (rating < 1 || rating > 5) {
        alert("Please enter a rating between 1 and 5.");
        return;
    }

    // Optional: Validate image URL format
    const imageUrlPattern = /\.(jpg|jpeg|png|gif)$/i; // Valid image file extensions
    if (!imageUrlPattern.test(imageUrl)) {
        alert(
            "Please provide a valid image URL with a valid file extension (e.g., .jpg, .png, .gif)."
        );
        return;
    }

    // validate no special characters in restaurant name and location
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/g; // Detect special characters
    if (specialCharPattern.test(restaurantName)) {
        alert(
            "Please fill a proper name of the restaurant. Special characters cannot be included in the name of the restaurant."
        );
        return;
    }
    if (specialCharPattern.test(location)) {
        alert(
            "Please fill a proper name of the location. Special characters cannot be included in the location."
        );
        return;
    }

    //validate feedback length
    if (content.split(" ").filter(Boolean).length < 5) {
        alert("Feedback must be at least 5 words long.");
        return;
    }

    // Retrieve feedback ID and prepare data
    const feedbackId = localStorage.getItem("feedbackIdToUpdate");
    const feedbackData = {
        restaurantName,
        location,
        visitDate,
        rating,
        content,
        imageUrl,
    };

    // Send update request
    fetch(`/edit-feedback/${feedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === "Feedback modified successfully!") {
                alert("Feedback updated successfully!");
                window.location.href = "index.html";
            } else {
                alert("Failed to update feedback!");
            }
        })
        .catch((error) => console.error("Error updating feedback:", error));
}

// Cancel function to return to the main page without saving changes
function cancelPost() {
    window.location.href = "index.html";
}

// Function to delete feedback
function deleteFeedback(id) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (confirmDelete) {
        fetch(`/delete-feedback/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Feedback deleted successfully!") {
                    alert("Post deleted successfully!");
                    const postElement = document.getElementById(`post-${id}`);
                    if (postElement) {
                        postElement.remove(); // Remove the element from the DOM
                    }
                } else {
                    alert("Failed to delete the post!");
                }
            })
            .catch((error) => console.error("Error deleting feedback:", error));
    }
}

// Function to prepare feedback data for editing
function editFeedback(id) {
    fetch(`/get-feedback/${id}`)
        .then((response) => response.json())
        .then((data) => {
            if (data) {
                localStorage.setItem("feedbackToUpdate", JSON.stringify(data));
                window.location.href = "update.html"; // Navigate to update page
            } else {
                alert("Failed to load feedback data for editing.");
            }
        })
        .catch((error) =>
            console.error("Error fetching feedback data:", error)
        );
}
