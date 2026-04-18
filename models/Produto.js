const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  stock: Number,
  supermercado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supermercado"
  }
});

module.exports = mongoose.model("Produto", produtoSchema);