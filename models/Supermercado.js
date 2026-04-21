const mongoose = require("mongoose");

const supermercadoSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  localizacao: String,
  horario: String,
  metodoEntrega: String,
  custoEntrega: Number,
  aprovado: {
    type: Boolean,
    default: false
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
});

module.exports = mongoose.model("Supermercado", supermercadoSchema);