const mongoose = require("mongoose");

const vendaSchema = new mongoose.Schema({
  produtos: [
    {
      produto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produto"
      },
      quantidade: Number
    }
  ],
  total: Number,
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  data: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Venda", vendaSchema);