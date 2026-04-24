const Categoria = require("../models/Categoria");
const Produto = require("../models/Produto");
const Supermercado = require("../models/Supermercado");
const User = require("../models/User");
const Venda = require("../models/Venda");

async function dashboard(req, res) {
  const user = await User.findById(req.user.id);
  return res.render("admin/dashboard", { user });
}

async function listarUsers(req, res) {
  const users = await User.find().sort({ role: 1, nome: 1 });
  return res.render("admin/users", { users });
}

async function atualizarRole(req, res) {
  const role = String(req.body?.role || "");
  const allowedRoles = new Set(["admin", "supermercado", "estafeta", "cliente"]);

  if (!allowedRoles.has(role)) {
    return res.send("Role inválida.");
  }

  if (String(req.params.id) === String(req.user.id)) {
    return res.send("Não podes alterar o teu próprio role.");
  }

  await User.findByIdAndUpdate(req.params.id, { role });
  return res.redirect("/admin/users");
}

async function apagarUser(req, res) {
  if (String(req.params.id) === String(req.user.id)) {
    return res.send("Não podes apagar a tua própria conta.");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.send("Utilizador não encontrado.");
  }

  if (user.role === "admin") {
    return res.send("Não é permitido apagar contas de administrador.");
  }

  await User.findByIdAndDelete(req.params.id);
  return res.redirect("/admin/users");
}

async function listarSupermercados(req, res) {
  const supermercadosPendentes = await Supermercado.find({ aprovado: false }).populate("user");
  const supermercadosAprovados = await Supermercado.find({ aprovado: true }).populate("user");

  return res.render("admin/supermercados", { supermercadosPendentes, supermercadosAprovados });
}

async function detalheSupermercado(req, res) {
  const supermercado = await Supermercado.findById(req.params.id).populate("user");

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  return res.render("admin/detalhe-supermercado", { supermercado });
}

async function listarProdutos(req, res) {
  const produtos = await Produto.find().populate("supermercado").populate("categoria");
  return res.render("admin/produtos", { produtos });
}

async function listarVendas(req, res) {
  const vendas = await Venda.find()
    .populate("cliente")
    .populate("supermercado")
    .populate("estafeta")
    .sort({ createdAt: -1 });

  return res.render("admin/vendas", { vendas });
}

async function listarCategorias(req, res) {
  const categorias = await Categoria.find();
  return res.render("admin/categorias", { categorias });
}

async function novaCategoriaForm(req, res) {
  return res.render("admin/nova-categoria");
}

async function criarCategoria(req, res) {
  const { nome } = req.body;
  const novaCategoria = new Categoria({ nome });
  await novaCategoria.save();
  return res.redirect("/admin/categorias");
}

async function editarCategoriaForm(req, res) {
  const categoria = await Categoria.findById(req.params.id);
  return res.render("admin/editar-categoria", { categoria });
}

async function atualizarCategoria(req, res) {
  const { nome } = req.body;
  await Categoria.findByIdAndUpdate(req.params.id, { nome });
  return res.redirect("/admin/categorias");
}

async function apagarCategoria(req, res) {
  await Categoria.findByIdAndDelete(req.params.id);
  return res.redirect("/admin/categorias");
}

module.exports = {
  dashboard,
  listarUsers,
  atualizarRole,
  apagarUser,
  listarSupermercados,
  detalheSupermercado,
  listarProdutos,
  listarVendas,
  listarCategorias,
  novaCategoriaForm,
  criarCategoria,
  editarCategoriaForm,
  atualizarCategoria,
  apagarCategoria
};

