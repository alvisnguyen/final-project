const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const bcrypt = require('bcrypt');

let users = [
  { "username": "johndoe", "password": "123456" },
  { "username": "janedoe", "password": "654321" }
];

let reviews = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Use bcrypt to hash and compare the password
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && bcrypt.compareSync(password, user.password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide a valid username and password." });
  }
  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    return res.status(200).json({ message: "User successfully logged in." });
  } else {
    return res.status(401).json({ message: "Invalid login credentials." });
  }
});

regd_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) { 
      const hashedPassword = bcrypt.hashSync(password, 10);
      users.push({ "username": username, "password": hashedPassword });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });    
    }
  } 
  return res.status(400).json({ message: "Unable to register user." });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username } = req.session;
  const { isbn } = req.params;
  const { review } = req.query;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  if (!isbn || !review) {
    return res.status(400).json({ message: "Please provide a valid ISBN and review." });
  }

  const userReviewIndex = reviews.findIndex(r => r.isbn === isbn && r.username === username);
  if (userReviewIndex !== -1) {
    // If the same user posts a different review on the same ISBN, modify the existing review
    reviews[userReviewIndex].review = review;
    return res.status(200).json({ message: "Review updated successfully." });
  } else {
    // If another user logs in and posts a review on the same ISBN, add it as a new review
    reviews.push({ "isbn": isbn, "username": username, "review": review });
    return res.status(200).json({ message: "Review added successfully." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.reviews = reviews;