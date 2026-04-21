const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  categoria: String,
  preco: {
    type: Number,
    min: 0
  }, 
  imagem: String,
  stock: Number,
  supermercado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supermercado"
  }
});

module.exports = mongoose.model("Produto", produtoSchema);

// stock: { type: Number, min: 0 }