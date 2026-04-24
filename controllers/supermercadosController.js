const Produto = require("../models/Produto");
const Supermercado = require("../models/Supermercado");
const User = require("../models/User");
const Venda = require("../models/Venda");

async function listar(req, res) {
  const supermercados = await Supermercado.find().populate("user");
  return res.render("supermercados/index", { supermercados });
}

async function novoForm(req, res) {
  return res.render("supermercados/novo");
}

async function criar(req, res) {
  const { nome, descricao, localizacao, horario, metodoEntrega, custoEntrega } = req.body;

  const supermercadoExistente = await Supermercado.findOne({ user: req.user.id });

  if (supermercadoExistente) {
    return res.send("Este utilizador já tem um supermercado associado.");
  }

  const novoSupermercado = new Supermercado({
    nome,
    descricao,
    localizacao,
    horario,
    metodoEntrega,
    custoEntrega,
    aprovado: false,
    user: req.user.id
  });

  await novoSupermercado.save();
  return res.redirect("/dashboard");
}

async function editarForm(req, res) {
  const supermercado = await Supermercado.findById(req.params.id);

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  if (String(supermercado.user) !== String(req.user.id)) {
    return res.send("Acesso negado.");
  }

  return res.render("supermercados/editar", { supermercado });
}

async function atualizar(req, res) {
  const supermercado = await Supermercado.findById(req.params.id);

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  if (String(supermercado.user) !== String(req.user.id)) {
    return res.send("Acesso negado.");
  }

  const { nome, descricao, localizacao, horario, metodoEntrega, custoEntrega } = req.body;

  await Supermercado.findByIdAndUpdate(req.params.id, {
    nome,
    descricao,
    localizacao,
    horario,
    metodoEntrega,
    custoEntrega
  });

  return res.redirect("/supermercado/dashboard");
}

async function apagar(req, res) {
  const supermercado = await Supermercado.findById(req.params.id);

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  if (String(supermercado.user) !== String(req.user.id)) {
    return res.send("Acesso negado.");
  }

  await Supermercado.findByIdAndDelete(req.params.id);
  return res.redirect("/dashboard");
}

async function aprovar(req, res) {
  await Supermercado.findByIdAndUpdate(req.params.id, { aprovado: true });
  return res.redirect("/admin/supermercados");
}

async function rejeitar(req, res) {
  await Supermercado.findByIdAndUpdate(req.params.id, { aprovado: false });
  return res.redirect("/admin/supermercados");
}

async function dashboard(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id });

  if (!supermercado) {
    return res.send("Ainda não tens supermercado associado.");
  }

  if (!supermercado.aprovado) {
    return res.send("O teu supermercado ainda não foi aprovado por um admin.");
  }

  const produtos = await Produto.find({ supermercado: supermercado._id }).populate("categoria");

  return res.render("supermercados/dashboard", {
    user,
    supermercado,
    produtos
  });
}

async function clientes(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id });

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  const vendas = await Venda.find({ supermercado: supermercado._id }).populate("cliente");

  const clientesMap = {};
  vendas.forEach(v => {
    if (v.cliente) {
      clientesMap[v.cliente._id] = v.cliente;
    }
  });

  const clientes = Object.values(clientesMap);
  return res.render("supermercados/clientes", { supermercado, clientes });
}

async function encomendas(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id });

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  const encomendas = await Venda.find({
    supermercado: supermercado._id,
    tipoEntrega: "domicilio"
  })
    .populate("cliente")
    .populate("estafeta")
    .sort({ createdAt: -1 });

  return res.render("supermercados/encomendas", { supermercado, encomendas });
}

module.exports = {
  listar,
  novoForm,
  criar,
  editarForm,
  atualizar,
  apagar,
  aprovar,
  rejeitar,
  dashboard,
  clientes,
  encomendas
};

