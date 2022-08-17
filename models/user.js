
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let user = new Schema({
  email: String,
  password: String,
  token: String,
  verified: Boolean,
}, { timestamps: true });

const model = mongoose.model("users", user);

module.exports = model;