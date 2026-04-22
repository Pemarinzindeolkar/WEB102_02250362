const express = require("express");
const app = express();

app.use(express.json());

// SAMPLE DATA (temporary)
let books = [
  { id: 1, title: "Book A", author: "Author A", available: true }
];

// GET all books
app.get("/api/books", (req, res) => {
  res.json(books);
});

// ADD book
app.post("/api/books", (req, res) => {
  const newBook = req.body;
  books.push(newBook);
  res.status(201).json(newBook);
});

// GET book by ID
app.get("/api/books/:id", (req, res) => {
  const book = books.find(b => b.id == req.params.id);
  
  if (!book) {
    return res.status(404).json({
      errorCode: "BOOK_NOT_FOUND",
      message: "Book not found"
    });
  }

  res.json(book);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});