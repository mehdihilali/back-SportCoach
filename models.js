const mongoose = require('mongoose');

// User Details Schema
const UserDetailSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  diagnosticCompleted: { type: Boolean, default: false },
}, {
  collection: "UserInfo"
});

// Diagnostic Details Schema
const DiagnosticDetailSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  responses: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
  recommendation: { type: Map, of: mongoose.Schema.Types.Mixed }, // Add recommendation field
}, {
  collection: "DiagnosticInfo"
});

mongoose.model("UserInfo", UserDetailSchema);
mongoose.model("DiagnosticInfo", DiagnosticDetailSchema);
