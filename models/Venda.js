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
  tipoEntrega: {
    type: String,
    enum: ["loja", "domicilio"],
    default: "loja"
  },
  metodoEntrega: {
    type: String,
    default: ""
  },
  custoEntrega: {
    type: Number,
    default: 0
  },
  estadoEntrega: {
    type: String,
    enum: ["pendente", "aceite", "em_transito", "entregue"],
    default: null
  },
  estafeta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
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
