const mongoose = require('mongoose');

const UserDetailSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  diagnosticCompleted: { type: Boolean, default: false },  // Add this line
}, {
  collection: "UserInfo"
});

mongoose.model("UserInfo", UserDetailSchema);