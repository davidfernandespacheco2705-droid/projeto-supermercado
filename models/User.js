const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "supermercado", "estafeta", "cliente"]
  }
});

module.exports = mongoose.model("User", userSchema);