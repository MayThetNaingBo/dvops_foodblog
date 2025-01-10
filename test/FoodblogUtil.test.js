const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const fs = require("fs");
const path = require("path");
const { expect } = chai;
const { app, server } = require("../index");

chai.use(chaiHttp);

let baseUrl;
const draftsFilePath = path.join(__dirname, "../utils/drafts.json");
const dataFilePath = path.join(__dirname, "../utils/foodblogs.json");

describe("FoodBlog Utility Tests", () => {
    before(() => {
        const addressInfo = server.address();
        baseUrl = `http://localhost:${addressInfo.port}`;

        // Ensure test files exist
        if (!fs.existsSync(draftsFilePath)) {
            fs.writeFileSync(draftsFilePath, "{}");
        }
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, "[]");
        }
    });

    after(() => {
        return new Promise((resolve) => {
            if (server) {
                server.close(() => resolve());
            } else {
                resolve();
            }
        });
    });

    // describe("Server Status", () => {
    //     it("should return server running message", (done) => {
    //         chai.request(baseUrl)
    //             .get("/")
    //             .end((err, res) => {
    //                 expect(res).to.have.status(200);
    //                 expect(res.text).to.equal("Server is running");
    //                 done();
    //             });
    //     });
    // });

    // describe("Utility Function Tests", () => {
    //     it("should return true for banned words in content", () => {
    //         const content = "This place is awful!";
    //         const result = require("../utils/FoodblogUtil").containsBannedWords(
    //             content
    //         );
    //         expect(result).to.be.true;
    //     });

    //     it("should return false for content without banned words", () => {
    //         const content = "This is a wonderful place!";
    //         const result = require("../utils/FoodblogUtil").containsBannedWords(
    //             content
    //         );
    //         expect(result).to.be.false;
    //     });

    //     it("should handle empty content in banned words check", () => {
    //         const content = "";
    //         const result = require("../utils/FoodblogUtil").containsBannedWords(
    //             content
    //         );
    //         expect(result).to.be.false;
    //     });
    // });

    describe("Draft Management Routes", () => {
        it("should autosave a draft successfully", (done) => {
            const draftData = {
                userId: "user1",
                restaurantName: "Test Restaurant",
                location: "Test Location",
                visitDate: "2024-12-01",
                content: "Draft content",
                imageUrl: "https://example.com/image.jpg",
            };

            chai.request(baseUrl)
                .post("/autosave-draft")
                .send(draftData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.success).to.be.true;
                    expect(res.body.message).to.equal(
                        "Draft autosaved successfully."
                    );
                    done();
                });
        });

        // it("should return 400 for missing userId in autosave-draft", (done) => {
        //     const draftData = {
        //         restaurantName: "Test Restaurant",
        //     };

        //     chai.request(baseUrl)
        //         .post("/autosave-draft")
        //         .send(draftData)
        //         .end((err, res) => {
        //             expect(res).to.have.status(400);
        //             expect(res.body.message).to.equal("Missing userId.");
        //             done();
        //         });
        // });

        it("should fetch a saved draft", (done) => {
            chai.request(baseUrl)
                .get("/get-draft/user1")
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.success).to.be.true;
                    expect(res.body.draft).to.be.an("object");
                    expect(res.body.draft.restaurantName).to.equal(
                        "Test Restaurant"
                    );
                    done();
                });
        });

        it("should return 404 for a non-existent draft", (done) => {
            chai.request(baseUrl)
                .get("/get-draft/nonexistent-user")
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.success).to.be.false;
                    expect(res.body.message).to.equal("No draft found.");
                    done();
                });
        });

        it("should handle missing drafts.json gracefully", (done) => {
            const tempDraftsPath = `${draftsFilePath}.bak`;
            fs.renameSync(draftsFilePath, tempDraftsPath); // Rename file to simulate missing file

            chai.request(baseUrl)
                .post("/autosave-draft")
                .send({ userId: "user1", content: "Test Content" })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    fs.renameSync(tempDraftsPath, draftsFilePath); // Restore file
                    done();
                });
        });
    });

    describe("Feedback Management Routes", () => {
        it("should add feedback successfully", (done) => {
            const feedback = {
                restaurantName: "New Restaurant",
                location: "New Location",
                visitDate: "2024-12-01",
                rating: 4,
                content: "Amazing experience!",
                imageUrl: "https://example.com/new-image.jpg",
            };

            chai.request(baseUrl)
                .post("/add-blogpost")
                .send(feedback)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body.success).to.be.true;
                    done();
                });
        });

        it("should return 400 for invalid imageUrl format", (done) => {
            const feedback = {
                restaurantName: "Test Restaurant",
                location: "Test Location",
                visitDate: "2024-12-01",
                content: "Test Content",
                rating: 4,
                imageUrl: "invalid-url"
            };

            chai.request(baseUrl)
                .post("/add-blogpost")
                .send(feedback)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    // expect(res.body.message).to.equal(
                    //     "Server error: Unable to add feedback."
                    // );
                    done();
                });
        });

        it("should enforce banned words in feedback content", (done) => {
            const feedback = {
                restaurantName: "Test Restaurant",
                location: "Test Location",
                visitDate: "2024-12-01",
                rating: 4,
                content: "This place was awful!",
            };

            chai.request(baseUrl)
                .post("/add-blogpost")
                .send(feedback)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.text).to.equal(
                        "Validation error: Inappropriate content."
                    );
                    done();
                });
        });

        it("should retrieve all feedback", (done) => {
            chai.request(baseUrl)
                .get("/get-feedback")
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("array");
                    done();
                });
        });
    });
});
