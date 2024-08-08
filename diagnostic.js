const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const generateRecommendation = require('./generateRecommendation'); // Make sure this path is correct

require('./models');  // Import models

const Diagnostic = mongoose.model("DiagnosticInfo");
const User = mongoose.model("UserInfo");
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log("Token not found");
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

router.post('/save-diagnostic', authenticateToken, async (req, res) => {
  const { responses } = req.body;
  const userEmail = req.user.email;

  console.log("Saving diagnostic information for user:", userEmail);
  console.log("Responses:", JSON.stringify(responses, null, 2)); // Pretty print the responses

  try {
    const diagnostic = new Diagnostic({ userEmail, responses });
    await diagnostic.save();

    // Update the user's diagnosticCompleted status
    await User.updateOne({ email: userEmail }, { $set: { diagnosticCompleted: true } });

    console.log("Diagnostic information saved:", diagnostic);

    // Generate recommendation
    const recommendation = await generateRecommendation(diagnostic);
    diagnostic.recommendation = recommendation;
    await diagnostic.save();

    res.send({ status: 'ok', data: 'Diagnostic information saved' });
  } catch (error) {
    console.error("Error saving diagnostic information:", error);
    res.send({ status: 'error', data: error.message });
  }
});

router.get('/get-diagnostic', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;

  try {
    const diagnostic = await Diagnostic.findOne({ userEmail });
    if (!diagnostic) {
      return res.send({ status: 'not_completed', data: null });
    }

    res.send({ status: 'completed', data: diagnostic });
  } catch (error) {
    console.error("Error fetching diagnostic information:", error);
    res.send({ status: 'error', data: error.message });
  }
});

module.exports = router;
