const Produto = require("../models/Produto");
const Supermercado = require("../models/Supermercado");
const User = require("../models/User");
const Venda = require("../models/Venda");

async function showRegister(req, res) {
  return res.render("users/novo");
}

async function register(req, res) {
  const { nome, username, email, password, morada, telefone, role } = req.body;

  try {
    const user = new User({
      nome,
      username,
      email,
      password,
      morada,
      telefone,
      role
    });

    await user.save();
    return res.redirect("/login");
  } catch (error) {
    console.error("Erro a criar utilizador:", error);
    return res.status(400).send("Erro a criar utilizador. Verifica se username/email já existem.");
  }
}

async function perfil(req, res) {
  const user = await User.findById(req.user.id);

  let vendas = [];
  let supermercadosPendentes = [];
  let produtos = [];

  if (user?.role === "cliente") {
    vendas = await Venda.find({ cliente: user._id })
      .populate("produtos.produto")
      .sort({ createdAt: -1 });
  }

  if (user?.role === "admin") {
    supermercadosPendentes = await Supermercado.find({ aprovado: false });
  }

  if (user?.role === "supermercado") {
    const supermercadoDoUser = await Supermercado.findOne({ user: user._id });

    if (supermercadoDoUser) {
      produtos = await Produto.find({ supermercado: supermercadoDoUser._id }).populate("categoria");
    }
  }

  return res.render("users/perfil", {
    user,
    vendas,
    supermercadosPendentes,
    produtos
  });
}

module.exports = {
  showRegister,
  register,
  perfil
};

