const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

require('./models');  // Import models

const User = mongoose.model("UserInfo");
const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ status: 'error', data: 'Token not provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ status: 'error', data: 'Invalid token' });
    req.user = user;
    next();
  });
};

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const oldUser = await User.findOne({ email: email });

  if (oldUser) {
    return res.status(400).json({ status: 'error', data: 'User already exists' });
  }

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    await User.create({
      username: username,
      email: email,
      password: encryptedPassword,
    });
    res.status(201).json({ status: 'ok', data: 'User Created' });
  } catch (error) {
    console.error("User Registration Error: ", error);
    res.status(500).json({ status: 'error', data: 'Internal Server Error' });
  }
});

router.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  const oldUser = await User.findOne({ email: email });

  if (!oldUser) {
    return res.status(400).json({ status: 'error', data: 'User does not exist' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ status: 'error', data: 'Invalid password' });
  }

  const token = jwt.sign({ email: oldUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ status: "ok", data: { token } });
});

router.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    let user = await User.findOne({ email: email });

    if (!user) {
      // Create a new user if they don't exist in the database
      user = await User.create({
        username: name,
        email: email,
        password: '', // No password for Google users
      });
    }

    const jwtToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '100y' });

    res.status(200).json({ status: "ok", data: { token: jwtToken } });
  } catch (error) {
    console.error("Google Login Error: ", error);
    res.status(400).json({ status: "error", data: "Invalid Google token" });
  }
});

router.get('/user-info', authenticateToken, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (user) {
    res.status(200).json({ status: 'ok', data: { email: user.email, username: user.username, diagnosticCompleted: user.diagnosticCompleted } });
  } else {
    res.status(404).json({ status: 'error', data: 'User not found' });
  }
});

module.exports = router;