const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth');
const diagnosticRoutes = require('./diagnostic');
require('dotenv').config();
require('./models'); // Import models
const generateRecommendation = require('./generateRecommendation'); // Import recommendation logic

const app = express();

app.use(express.json());

const mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl).then(() => {
    console.log("Database connected successfully ... ");
}).catch((error) => {
    console.error("Database connection error:", error);
});

app.get("/", (req, res) => {
    res.send({status:"started"});
    console.log("Server status: started");
});

app.use(authRoutes);
app.use(diagnosticRoutes);

app.listen(5001, () => {
    console.log("Node.js server started on port 5001.");
});
