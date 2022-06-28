const mongoose = require("mongoose");

if (process.argv.length < 3) {
    console.log("Please provide the password as an argument: node mongo.js <password>");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://exc:${password}@cluster0.jpep5cz.mongodb.net/noteApp?retryWrites=true&w=majority`;

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean
});

const Note = mongoose.model("Note", noteSchema);

mongoose
    .connect(url)
    .then(() => {
        console.log("Connected");
        Note.find({}).then(result => {
            result.forEach(note => {
                console.log(note);
            });
            mongoose.connection.close();
        });
    });