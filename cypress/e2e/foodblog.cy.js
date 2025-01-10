describe("Food Blog Frontend", () => {
    let baseUrl;

    before(() => {
        // Start the server and navigate to the base URL
        cy.task("startServer").then((url) => {
            baseUrl = url;
            cy.visit(baseUrl);
        });
    });

    after(() => {
        // Stop the server after all tests
        return cy.task("stopServer");
    });

    beforeEach(() => {
        // Ensure the base URL is visited before each test
        cy.visit(baseUrl);
    });

    it("should cancel a new blog post successfully", () => {
        cy.log("Adding a new blog post");

        cy.get('a[class="btn fixed-post-button"]').click();

        // Fill out the form
        cy.get("#restaurantName").type("Test Cancel Restaurant");
        cy.get("#location").type("Test Location");
        cy.get("#visitDate").type("2024-12-01");
        cy.get("#content").type("This is a valid test blog post content.");
        cy.get('input[name="rating"]').check("4", {force: true});

        // Submit the form
        cy.get('button[onclick="submitPost()"').click();
        cy.get("#cancel-btn").click();


        // Verify the new blog post is displayed
        cy.get("#notification-message")
        .should("contain.text", "Post cancelled.")
        .and("be.visible");
    });

    it("should add a new blog post successfully", () => {
        cy.log("Adding a new blog post");

        cy.get('a[class="btn fixed-post-button"]').click();

        // Fill out the form
        cy.get("#restaurantName").type("Test Restaurant");
        cy.get("#location").type("Test Location");
        cy.get("#visitDate").type("2024-12-01");
        cy.get("#content").type("This is a valid test blog post content.");
        cy.get('input[name="rating"]').check("4", {force: true});

        // Submit the form
        cy.get('button[onclick="submitPost()"').click();
        cy.get("#confirm-btn").click();


        // Verify the new blog post is displayed
        cy.get("#blog-posts-container")
            .contains("Test Restaurant")
            .should("exist");
        cy.get("#blog-posts-container")
            .contains("Test Location")
            .should("exist");
    });

    it("should show error if required fields are missing", () => {
        cy.log("Submitting the form with missing required fields");

        cy.get('a[class="btn fixed-post-button"]').click();
        cy.get("#cancel-btn").click();


        // Leave all fields empty and attempt to submit
        cy.get('button[onclick="submitPost()"').click();

        // Verify error message is displayed
        // cy.get("#info-message").should("have.class", "error");
        cy.get("#notification-message")
            .should("contain.text", "All fields are required!")
            .and("be.visible");
    });

    it("should show error if restaurant name contains a URL", () => {
        cy.log("Testing validation for restaurant name with a URL");

        cy.get('a[class="btn fixed-post-button"]').click();

        // Fill out the form with a URL in the restaurant name
        cy.get("#restaurantName").type("www.example.com");
        cy.get("#location").type("Test Location");
        cy.get("#visitDate").type("2024-12-01");
        cy.get("#content").type("This is a valid test blog post content.");
        cy.get('input[name="rating"]').check("4", {force: true});

        // Attempt to submit the form
        cy.get('button[onclick="submitPost()"').click();

        // Verify error message
        // cy.get("#info-message").should("have.class", "error");
        cy.get("#notification-message")
            .should("contain.text", "Restaurant name should not contain URLs.")
            .and("be.visible");
    });

    it("should show error if feedback content is too short", () => {
        cy.log("Testing validation for feedback content length");

        cy.get('a[class="btn fixed-post-button"]').click();

        // Fill out the form with short feedback content
        cy.get("#restaurantName").type("Test Restaurant");
        cy.get("#location").type("Test Location");
        cy.get("#visitDate").type("2024-12-01");
        cy.get("#content").type("Short");
        cy.get('input[name="rating"]').check("4", {force: true});

        // Attempt to submit the form
        // cy.get("#submitPostBtn").click();
        cy.get('button[onclick="submitPost()"').click();

        // Verify error message
        // cy.get("#info-message").should("have.class", "error");
        cy.get("#notification-message")
            .should("contain.text", "Feedback must be at least 5 words.")
            .and("be.visible");
    });

    it("should autosave draft every 10 seconds", () => {
        cy.log("Testing autosave functionality");

        cy.get('a[class="btn fixed-post-button"]').click();

        // Fill out some of the fields
        cy.get("#restaurantName").type("Draft Restaurant");
        cy.get("#location").type("Draft Location");

        // Wait for 10 seconds to trigger autosave
        cy.wait(11000);

        // Verify autosave draft was called
        cy.request("/get-draft/user123").then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.draft.restaurantName).to.eq(
                "Draft Restaurant"
            );
            expect(response.body.draft.location).to.eq("Draft Location");
        });
    });

    it("should recover a saved draft on page load", () => {
        cy.log("Testing draft recovery");

        // Simulate saved draft in the server
        cy.request("POST", "/autosave-draft", {
            userId: "user123",
            restaurantName: "Recovered Restaurant",
            location: "Recovered Location",
            visitDate: "2024-12-02",
            content: "This is a recovered draft.",
            imageUrl: "",
        });

        cy.get('a[class="btn fixed-post-button"]').click();


        // Reload the page to trigger draft recovery
        cy.reload();
        cy.get("#confirm-btn").click();

        // Verify the draft is recovered in the form fields
        cy.get("#restaurantName").should("have.value", "Recovered Restaurant");
        cy.get("#location").should("have.value", "Recovered Location");
        cy.get("#visitDate").should("have.value", "2024-12-02");
        cy.get("#content").should("have.value", "This is a recovered draft.");
    });
});

// describe("Food Blog Frontend", () => {
//     let baseUrl = "http://localhost:3000"; // Update with your actual base URL

//     beforeEach(() => {
//         // Ensure the base URL is visited before each test
//         cy.visit(baseUrl);
//     });

//     // Test for the POST button on index.html
//     it("should navigate to addpost.html when the POST button is clicked", () => {
//         cy.get(".fixed-post-button").should("exist").click();
//         cy.url().should("include", "/addpost.html");
//     });

//     // Test for the POST button on addpost.html
//     it("should submit a new post when all fields are filled", () => {
//         cy.visit(`${baseUrl}/addpost.html`);

//         // Fill the form
//         cy.get("#restaurantName").type("Test Restaurant");
//         cy.get("#location").type("Test Location");
//         cy.get("#visitDate").type("2024-12-01");
//         cy.get("#content").type("This is a valid test blog post content.");
//         cy.get('input[name="rating"]').check("4");
//         cy.get("#imageUrl").type("https://example.com/test-image.jpg");

//         // Click the Post button
//         cy.get('button[onclick="submitPost()"]').click();

//         // Verify success notification
//         cy.get("#info-message")
//             .should("have.class", "success")
//             .and("be.visible");
//         cy.get("#notification-message")
//             .should("contain.text", "Feedback posted successfully!");
//     });

//     // Test for the Cancel button on addpost.html
//     it("should navigate back to index.html when the Cancel button is clicked", () => {
//         cy.visit(`${baseUrl}/addpost.html`);

//         // Click the Cancel button
//         cy.get('button[onclick="cancelPost()"]').click();

//         // Verify redirection to index.html
//         cy.url().should("include", "/index.html");
//     });

//     // Test for viewing feedback modal on index.html
//     it("should display feedback details in the modal", () => {
//         // Simulate a blog post
//         const feedback = {
//             restaurantName: "Test Restaurant",
//             location: "Test Location",
//             visitDate: "2024-12-01",
//             content: "This is a test feedback content.",
//             imageUrl: "https://example.com/test-image.jpg",
//             rating: "4",
//         };

//         // Add a blog post directly to the DOM (mocking the display)
//         cy.get("#blog-posts-container").then((container) => {
//             const postHTML = `
//                 <div class="col-md-4 mb-3">
//                     <div class="card h-100">
//                         <div data-toggle="modal" data-target="#viewBlogPostModal">
//                             <img src="${feedback.imageUrl}" class="card-img-top" alt="${feedback.restaurantName}">
//                             <div class="card-body">
//                                 <h5 class="card-title">${feedback.restaurantName}</h5>
//                                 <p class="card-text">${feedback.content}</p>
//                                 <div>Rating: <span style="color: gold;">&#9733;&#9733;&#9733;&#9733;</span></div>
//                                 <small class="text-muted">Location: ${feedback.location} | Date: ${feedback.visitDate}</small>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `;
//             container[0].innerHTML = postHTML;
//         });

//         // Click on the blog post to open the modal
//         cy.get('[data-toggle="modal"]').click();

//         // Verify the modal displays the correct details
//         cy.get("#viewBlogPostModal").should("be.visible");
//         cy.get("#viewRestaurantName").should("have.text", feedback.restaurantName);
//         cy.get("#viewLocation").should("have.text", feedback.location);
//         cy.get("#viewVisitDate").should("have.text", feedback.visitDate);
//         cy.get("#viewContent").should("have.text", feedback.content);
//         cy.get("#viewImageUrl").should("have.attr", "src", feedback.imageUrl);
//     });

//     // Test for error handling when fields are empty on addpost.html
//     it("should show error when required fields are missing", () => {
//         cy.visit(`${baseUrl}/addpost.html`);

//         // Click the Post button without filling any field
//         cy.get('button[onclick="submitPost()"]').click();

//         // Verify error notification
//         cy.get("#info-message").should("have.class", "error");
//         cy.get("#notification-message")
//             .should("contain.text", "All fields are required!")
//             .and("be.visible");
//     });

//     // Test for autosave functionality
//     it("should autosave draft every 10 seconds", () => {
//         cy.visit(`${baseUrl}/addpost.html`);

//         // Fill out some of the fields
//         cy.get("#restaurantName").type("Draft Restaurant");
//         cy.get("#location").type("Draft Location");

//         // Wait for 10 seconds to trigger autosave
//         cy.wait(11000);

//         // Verify autosave draft was called
//         cy.request("/get-draft/user123").then((response) => {
//             expect(response.status).to.eq(200);
//             expect(response.body.draft.restaurantName).to.eq(
//                 "Draft Restaurant"
//             );
//             expect(response.body.draft.location).to.eq("Draft Location");
//         });
//     });
// });
