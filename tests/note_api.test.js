const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Note = require("../models/Note");

const initialNotes = [
    {
        content: "HTML is Easy",
        date: new Date(),
        important: false
    },
    {
        content: "Browser can execute only Javascript",
        date: new Date(),
        important: true
    }
];

beforeEach(async () => {
    await Note.deleteMany({});
    let noteObject = new Note(initialNotes[0]);
    await noteObject.save();
    noteObject = new Note(initialNotes[1]);
    await noteObject.save();
});

test("Notes are returned as JSON", async () => {
    await api
        .get("/api/notes")
        .expect(200)
        .expect("Content-Type", /application\/json/);
}, 100000);

test("All notes are returned", async () => {
    const response = await api.get("/api/notes");
    expect(response.body).toHaveLength(initialNotes.length);
});

test("A specific note is within the returned notes", async () => {
    const response = await api.get("/api/notes");
    const contents = response.body.map(r => r.content);
    expect(contents).toContain("Browser can execute only Javascript");
});

test("A valid note can be added", async () => {
    const newNote = {
        content: "async/await simplifies making async calls",
        important: true
    };

    await api
        .post("/api/notes")
        .send(newNote)
        .expect(201)
        .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/notes");
    const contents = response.body.map(r => r.content);

    expect(response.body).toHaveLength(initialNotes.length + 1);
    expect(contents).toContain("async/await simplifies making async calls");
});

test("Note without content is not added", async () => {
    const newNote = {
        important: true
    };

    await api
        .post("/api/notes")
        .send(newNote)
        .expect(400);

    const response = await api.get("/api/notes");
    expect(response.body).toHaveLength(initialNotes.length);
});

afterAll(() => {
    mongoose.connection.close();
});
