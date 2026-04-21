const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: String,
  username: {
  type: String,
  unique: true
},
  email: {
  type: String,
  unique: true
},
  password: String,
  morada: String,
  telefone: String,
  role: {
    type: String,
    enum: ["admin", "supermercado", "estafeta", "cliente"],
    default: "cliente"
  }
});

module.exports = mongoose.model("User", userSchema);