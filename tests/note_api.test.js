const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

test("Notes are returned as JSON", async () => {
    await api
        .get("/api/notes")
        .expect(200)
        .expect("Content-Type", /application\/json/);
}, 100000);

test("There are two notes", async () => {
    const response = await api.get("/api/notes");
    expect(response.body).toHaveLength(2);
});

test("The first note is about HTTP methods", async () => {
    const response = await api.get("/api/notes");
    expect(response.body[0].content).toBe("HTML is Easy");
});

afterAll(() => {
    mongoose.connection.close();
});
