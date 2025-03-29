const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// ✅ Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Create a new book
router.post("/", async (req, res) => {
  try {
    const { serialNumber, bookName, description } = req.body;

    if (!serialNumber || !bookName) {
      return res.status(400).json({ error: "Serial number and book name are required" });
    }

    // Check for unique serial number
    const existingBook = await Book.findOne({ serialNumber });
    if (existingBook) {
      return res.status(400).json({ error: "Serial number must be unique" });
    }

    const newBook = new Book({ serialNumber, bookName, description });
    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update a book
router.put("/:id", async (req, res) => {
  try {
    const { serialNumber, bookName, description } = req.body;

    // Ensure serial number is unique
    const existingBook = await Book.findOne({ serialNumber, _id: { $ne: req.params.id } });
    if (existingBook) {
      return res.status(400).json({ error: "Serial number must be unique" });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { serialNumber, bookName, description },
      { new: true, runValidators: true }
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a book
router.delete("/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
