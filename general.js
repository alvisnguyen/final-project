const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


function doesExist(username) {
  return users.some(user => user.username === username);
}

public_users.post('/register', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (Array.isArray(books)) {
    const book = books.find(b => b.isbn === isbn);
    if (book) {
      res.send(JSON.stringify(book, null, 2));
    } else {
      res.status(404).send(JSON.stringify({ message: 'Book not found' }, null, 2));
    }
  } else {
    res.status(500).send(JSON.stringify({ message: 'Internal server error' }, null, 2));
  }
});
  
// Get book details based on author
public_users.get('/books', function(req, res) {
  const author = req.query.author;
  if (author) {
    const filteredBooks = Object.values(books).filter(b => b.author === author);
    if (filteredBooks.length > 0) {
      res.send(JSON.stringify(filteredBooks, null, 2));
    } else {
      res.status(404).send(JSON.stringify({ message: 'No books found for author' }, null, 2));
    }
  } else {
    res.send(JSON.stringify(books, null, 2));
  }
});

// Get all books based on title
public_users.get('/title/:title', function(req, res) {
  const title = req.params.title;
  const book = Object.values(books).find(b => b.title === title);
  if (book) {
    res.send(JSON.stringify(book, null, 2));
  } else {
    res.status(404).send(JSON.stringify({ message: 'Book not found' }, null, 2));
  }
});


//  Get book review
public_users.get('/review/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  const book = Object.values(books).find(b => b.isbn === isbn);
  if (book) {
    const reviews = book.reviews;
    if (Object.keys(reviews).length > 0) {
      res.send(JSON.stringify(reviews, null, 2));
    } else {
      res.status(404).send(JSON.stringify({ message: 'No reviews found for book' }, null, 2));
    }
  } else {
    res.status(404).send(JSON.stringify({ message: 'Book not found' }, null, 2));
  }
});

module.exports.general = public_users;
