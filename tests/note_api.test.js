const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Note = require("../models/Note");

beforeEach(async () => {
    await Note.deleteMany({});

    const noteObjects = helper.initialNotes
        .map(note => new Note(note));
    const promiseArray = noteObjects.map(note => note.save());
    await Promise.all(promiseArray);
});

describe("When there is initially some notes saved", () => {
    test("Notes are returned as JSON", async () => {
        await api
            .get("/api/notes")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    }, 100000);

    test("All notes are returned", async () => {
        const response = await api.get("/api/notes");
        expect(response.body).toHaveLength(helper.initialNotes.length);
    });

    test("A specific note is within the returned notes", async () => {
        const response = await api.get("/api/notes");
        const contents = response.body.map(r => r.content);
        expect(contents).toContain("Browser can execute only Javascript");
    });
});

describe("Viewing a specific note", () => {
    test("Succeeds with a valid id", async () => {
        const notesAtStart = await helper.notesInDb();
        const noteToView = notesAtStart[0];

        const resultNote = await api
            .get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const processedNoteToView = JSON.parse(JSON.stringify(noteToView));
        expect(resultNote.body).toEqual(processedNoteToView);
    });

    test("Fails with statuscode 404 if note does not exist", async () => {
        const validNonExistingId = await helper.nonExistingId();
        console.log(validNonExistingId);
        await api
            .get(`/api/notes/${validNonExistingId}`)
            .expect(404);
    });

    test("Fails with statuscode 400 id is invalid", async () => {
        const invalidId = "5a3d5da59070081a82a3445";
        await api
            .get(`/api/notes/${invalidId}`)
            .expect(400);
    });
});

describe("Addition of a new note", () => {
    test("Succeeds with valid data", async () => {
        const newNote = {
            content: "async/await simplifies making async calls",
            important: true
        };

        await api
            .post("/api/notes")
            .send(newNote)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const notesAtEnd = await helper.notesInDb();
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

        const contents = notesAtEnd.map(n => n.content);
        expect(contents).toContain("async/await simplifies making async calls");
    });

    test("Fails with statuscode 400 if data invalid", async () => {
        const newNote = {
            important: true
        };

        await api
            .post("/api/notes")
            .send(newNote)
            .expect(400);

        const notesAtEnd = await helper.notesInDb();
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
    });
});

describe("Deletion of a note", () => {
    test("Succeeds with statuscode 204 if id is valid", async () => {
        const notesAtStart = await helper.notesInDb();
        const noteToDelete = notesAtStart[0];

        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(204);

        const notesAtEnd = await helper.notesInDb();
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);
        const contents = notesAtEnd.map(r => r.content);
        expect(contents).not.toContain(noteToDelete.content);
    });
});


afterAll(() => {
    mongoose.connection.close();
});
