const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria"
  },
  preco: Number,
  imagem: String,
  stock: Number,
  supermercado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supermercado"
  }
});

module.exports = mongoose.model("Produto", produtoSchema);