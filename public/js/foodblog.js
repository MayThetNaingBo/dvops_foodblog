let autosaveInterval;

// // Function to update character count for the content field
// function updateCharacterCount(fieldId, counterId, maxLength) {
//     const field = document.getElementById(fieldId);
//     const counter = document.getElementById(counterId);

//     if (field && counter) {
//         field.addEventListener("input", () => {
//             const currentLength = field.value.length;
//             counter.textContent = `${currentLength}/${maxLength} characters`;

//             // Change color to red when the limit is exceeded
//             if (currentLength > maxLength) {
//                 counter.style.color = "red";
//             } else {
//                 counter.style.color = "#888"; // default color
//             }
//         });
//     }
// }

// Initialize character count for content field with a maximum length of 500 characters
// document.addEventListener("DOMContentLoaded", () => {
//     const inputElement = document.querySelector("#input-id"); // Update with the correct ID or class.
//     if (inputElement) {
//         inputElement.addEventListener("input", updateCharacterCount);
//     } else {
//         console.warn("Element not found: #input-id");
//     }
// });

function startAutosave(userId) {
    autosaveInterval = setInterval(() => {
        const restaurantName = document.getElementById("restaurantName").value;
        const location = document.getElementById("location").value;
        const visitDate = document.getElementById("visitDate").value;
        const content = document.getElementById("content").value;
        const imageUrl =
            document.getElementById("imageUrl").value || "images/NoImage.jpg";

        const draftData = {
            userId,
            restaurantName,
            location,
            visitDate,
            content,
            imageUrl,
        };

        fetch("/autosave-draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draftData),
        })
            .then((response) => response.json())
            .then((data) => console.log("Draft autosaved:", data))
            .catch((error) => console.error("Error autosaving draft:", error));
    }, 10000); // Autosave every 10 seconds
}

function recoverDraft() {
    const userId = "user123"; // Replace with your method to fetch userId

    fetch(`/get-draft/${userId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success && data.draft) {
                const {
                    restaurantName,
                    location,
                    visitDate,
                    content,
                    imageUrl,
                } = data.draft;

                showNotification(
                    "You have an unsaved draft. Would you like to restore it?",
                    "info",
                    2000, // Duration for showing the message
                    (isConfirmed) => {
                        if (isConfirmed) {
                            document.getElementById("restaurantName").value =
                                restaurantName 
                            document.getElementById("location").value =
                                location 
                            document.getElementById("visitDate").value =
                                visitDate
                            document.getElementById("content").value =
                                content 
                            document.getElementById("imageUrl").value =
                                imageUrl || "images/NoImage.jpg";
                        } else {
                            showNotification(
                                "Draft recovery canceled.",
                                "info",
                                2000
                            );
                        }
                    },
                    true // Enable confirmation buttons
                );
            }
        })
        .catch((error) => {
            showNotification("Error recovering draft.", "error", 2000);
            console.error("Error recovering draft:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    recoverDraft();
    const userId = "user123"; // Replace with dynamic userId retrieval
    if (!autosaveInterval) startAutosave(userId);
});
function submitPost() {
    const restaurantName = document.getElementById("restaurantName").value;
    const location = document.getElementById("location").value;
    const visitDate = document.getElementById("visitDate").value;
    const content = document.getElementById("content").value;
    let imageUrl =
        document.getElementById("imageUrl").value || "images/NoImage.jpg"; // Set default image if empty
    const rating = document.querySelector(
        'input[name="rating"]:checked'
    )?.value;

    const MIN_CONTENT_LENGTH = 5; // Set minimum word count for feedback section
    const urlRegex = /(https?:\/\/|www\.)/i;

    // Check for empty fields
    if (!restaurantName || !location || !visitDate || !content || !rating) {
        showNotification("All fields are required!", "error", 2000);
        return;
    }

    // Check if restaurant name contains a URL
    if (urlRegex.test(restaurantName)) {
        showNotification(
            "Restaurant name should not contain URLs.",
            "error",
            2000
        );
        return;
    }

    // Check for minimum feedback section length
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < MIN_CONTENT_LENGTH) {
        showNotification(
            `Feedback must be at least ${MIN_CONTENT_LENGTH} words.`,
            "error",
            2000
        );
        return;
    }

    const feedbackData = {
        restaurantName,
        location,
        visitDate,
        rating,
        content,
        imageUrl,
    };

    // Show confirmation notification
    showNotification(
        "Are you sure you want to post this feedback?",
        "info",
        2000, // Duration for showing the message
        (isConfirmed) => {
            if (isConfirmed) {
                // Proceed with posting
                fetch("/add-blogpost", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(feedbackData),
                })
                    .then((response) => {
                        // if (!response.ok) {
                        //     return response.text().then((message) => {
                        //         throw new Error(message);
                        //     });
                        // }
                        return response.json();
                    })
                    .then((response) => {
                        if (response.success) {
                            showNotification(
                                "Feedback posted successfully!",
                                "success",
                                2000
                            );
                            setTimeout(() => {
                                window.location.href = "index.html";
                            }, 3000); // Redirect after showing success notification
                        }
                    })
                    .catch((error) => {
                        showNotification(error.message, "error", 2000);
                        console.error("Error occurred:", error);
                    });
            } 
            else {
                showNotification("Post cancelled.", "info", 2000);
            }
        },
        true // Enable confirmation buttons
    );
}

// function cancelPost() {
//     window.location.href = "index.html";
// }

/* Contents of foodblog.js */
// Add feedback function
// function addFeedback() {
//     const restaurantName = document.getElementById("restaurantName").value;
//     const location = document.getElementById("location").value;
//     const visitDate = document.getElementById("visitDate").value;
//     const rating = document.getElementById("rating").value;
//     const content = document.getElementById("content").value;
//     const imageUrl =
//         document.getElementById("imageFile").value || "images/NoImage.jpg";

//     const feedbackData = {
//         restaurantName,
//         location,
//         visitDate,
//         rating,
//         content,
//         imageUrl,
//     };

//     if (!restaurantName || !location || !visitDate || !content) {
//         alert("All fields are required!");
//         return;
//     }

//     fetch("/add-blogpost", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(feedbackData),
//     })
//         .then((response) => response.json())
//         .then((response) => {
//             if (response.success) {
//                 alert("Added Feedback for: " + restaurantName + "!");
//                 document.getElementById("blogPostForm").reset();
//                 fetchFeedback(); // Refresh the posts list to show the new entry
//             } else {
//                 alert(response.message || "Unable to add feedback!");
//             }
//         })
//         .catch((error) => {
//             alert("Network error. Unable to connect to server.");
//             console.error(
//                 "Network error occurred while sending feedback:",
//                 error
//             );
//         });
// }

// Fetch and display all feedback posts
function fetchFeedback() {
    fetch("/get-feedback")
        .then((response) => response.json())
        .then((data) => {
            displayPosts(data); // Use displayPosts to render all feedback
        })
        .catch((error) => console.error("Error fetching feedback:", error));
}

document.addEventListener("DOMContentLoaded", fetchFeedback);

// Function which dynamically displays all feedback posts on the main page
function displayPosts(data) {
    const postsContainer = document.getElementById("blog-posts-container");
    postsContainer.innerHTML = ""; // Clear any existing posts

    data.forEach((post) => {
        const postElement = document.createElement("div");
        if (postElement) {
        postElement.classList.add("col-md-4", "mb-3");
        postElement.id = `post-${post.id}`; // Unique ID for deletion

        const {
            restaurantName,
            location,
            visitDate,
            rating,
            content,
            imageUrl,
        } = post;

        // Generate stars based on the rating
        let stars = "Rating: ";
        for (let i = 1; i <= 5; i++) {
            stars += `<span style="color: ${
                i <= rating ? "gold" : "gray"
            };">&#9733;</span>`;
        }

        postElement.innerHTML = `
             <div class="card h-100">
                <div onclick="window.location.href='post.html?id=${post.id}'">
                    <img src="${imageUrl}" class="card-img-top" alt="${restaurantName}">
                    <div class="card-body">
                        <h5 class="card-title">${restaurantName}</h5>
                        <p class="card-text">${content}</p>
                        <div>${stars}</div>
                        <small class="text-muted">Location: ${location} | Date: ${visitDate}</small>   
                    </div>
                </div>
                <div class="mb-2 ml-3">
                    <button class="btn btn-warning" onclick="editFeedback('${post.id}')">Update</button>
                    <button class="btn btn-danger" onclick="deleteFeedback('${post.id}')">Delete</button>
                </div>
            </div>
        `;

        postsContainer.appendChild(postElement);
    }
    });
}

// Call fetchFeedback when the page loads to display the posts initially
document.addEventListener("DOMContentLoaded", fetchFeedback);

// notificatin confirmatin js
function showNotification(
    message,
    condition,
    duration = 3000,
    callback,
    isConfirm = false
) {
    const notification = document.getElementById("info-message");
    const notificationMessage = document.getElementById("notification-message");
    const confirmationButtons = document.getElementById("confirmation-buttons");
    const confirmBtn = document.getElementById("confirm-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    if (notificationMessage) notificationMessage.innerText = message;

    // Apply the style based on the condition
    // switch (condition && notification) {
    //     case "success":
    //         notification.classList.add("success");
    //         notification.classList.remove("error", "info");
    //         break;

    //     case "error":
    //         notification.classList.add("error");
    //         notification.classList.remove("success", "info");
    //         break;

    //     case "info":
    //         notification.classList.add("info");
    //         notification.classList.remove("success", "error");
    //         break;

    //     default:
    //         if (notification) notification.classList.remove("success", "error", "info");
    //         break;
    // }
    if (notification) notification.classList.remove("success", "error", "info");

    // Show the notification
    if (notification) notification.style.display = "block";

    // If confirmation is required, show buttons and handle clicks
    if (isConfirm) {
        confirmationButtons.style.display = "flex";

        confirmBtn.onclick = () => {
            confirmationButtons.style.display = "none";
            notification.style.display = "none";
            notificationMessage.innerText = "";
            notification.classList.remove("success", "error", "info");
            if (typeof callback === "function") {
                callback(true); // Pass `true` to indicate confirmation
            }
        };

        cancelBtn.onclick = () => {
            confirmationButtons.style.display = "none";
            if (notification) notification.style.display = "none";
            if (notification) notificationMessage.innerText = "";
            if (notification)  notification.classList.remove("success", "error", "info");
            if (typeof callback === "function") {
                callback(false); // Pass `false` to indicate cancellation
            }
        };
    } 
    // else {
    //     // Hide notification after the specified duration
    //     setTimeout(() => {
    //         if (notification)  notification.style.display = "none";
    //         notificationMessage.innerText = "";
    //         if (notification) notification.classList.remove("success", "error", "info");
    //         if (typeof callback === "function") {
    //             callback();
    //         }
    //     }, duration);
    // }
}
