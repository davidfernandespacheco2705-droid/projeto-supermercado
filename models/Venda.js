const mongoose = require("mongoose");

const vendaSchema = new mongoose.Schema({
  produtos: [
    {
      produto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produto",
        required: true
      },
      quantidade: {
        type: Number,
        required: true
      }
    }
  ],
  total: {
    type: Number,
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  supermercado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supermercado",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Venda", vendaSchema);