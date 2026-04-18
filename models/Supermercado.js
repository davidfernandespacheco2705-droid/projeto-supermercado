const mongoose = require("mongoose");

const supermercadoSchema = new mongoose.Schema({
  nome: String,
  localizacao: String
});

module.exports = mongoose.model("Supermercado", supermercadoSchema);