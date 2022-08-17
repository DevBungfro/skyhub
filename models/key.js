
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let key = new Schema({
  key: String,
  status: String,
  tool: String,
}, {timestamps: true});

const model = mongoose.model("key", key);

module.exports = model;