const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    unique: true,
    required: true,
  },
  bookName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
