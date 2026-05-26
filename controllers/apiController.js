const Categoria = require("../models/Categoria");
const Produto = require("../models/Produto");
const Supermercado = require("../models/Supermercado");
const User = require("../models/User");
const Venda = require("../models/Venda");

function parseNumber(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

async function listarSupermercados(req, res) {
  const supermercados = await Supermercado.find({ aprovado: true }).select("nome descricao localizacao horario metodoEntrega custoEntrega");
  return res.json(supermercados);
}

async function detalheSupermercado(req, res) {
  const supermercado = await Supermercado.findById(req.params.id).select("nome descricao localizacao horario metodoEntrega custoEntrega");

  if (!supermercado || !supermercado.aprovado) {
    return res.status(404).json({ error: "Supermercado não encontrado." });
  }

  return res.json(supermercado);
}

async function listarCategorias(req, res) {
  const categorias = await Categoria.find();
  return res.json(categorias);
}

async function listarProdutos(req, res) {
  const pesquisa = String(req.query.pesquisa || "").trim();
  const categoria = String(req.query.categoria || "").trim();
  const supermercadoId = String(req.query.supermercadoId || "").trim();

  const filtro = {};
  if (pesquisa) {
    filtro.nome = { $regex: pesquisa, $options: "i" };
  }
  if (categoria) {
    filtro.categoria = categoria;
  }
  if (supermercadoId) {
    filtro.supermercado = supermercadoId;
  }

  const produtos = await Produto.find(filtro)
    .populate("categoria")
    .populate({
      path: "supermercado",
      match: { aprovado: true }
    });

  const aprovados = produtos.filter(produto => produto.supermercado);
  return res.json(aprovados);
}

async function criarEncomenda(req, res) {
  const {
    cliente_nome,
    cliente_email,
    supermercadoId,
    produtos: produtosRecebidos,
    tipoEntrega = "domicilio"
  } = req.body;

  if (!cliente_nome || !cliente_email || !supermercadoId || !Array.isArray(produtosRecebidos) || produtosRecebidos.length === 0) {
    return res.status(400).json({ error: "Dados da encomenda incompletos." });
  }

  const supermercado = await Supermercado.findById(supermercadoId);
  if (!supermercado || !supermercado.aprovado) {
    return res.status(400).json({ error: "Supermercado inválido." });
  }

  let cliente = await User.findOne({ email: cliente_email });
  if (!cliente) {
    cliente = new User({
      nome: cliente_nome,
      username: cliente_email,
      email: cliente_email,
      password: "cliente123",
      morada: "",
      telefone: "",
      role: "cliente"
    });
    await cliente.save();
  }

  const produtosVenda = [];
  let total = 0;

  for (const item of produtosRecebidos) {
    const quantidade = parseInt(item.quantidade, 10);
    if (!item.id || !Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({ error: "Produto inválido na encomenda." });
    }

    const produto = await Produto.findById(item.id);
    if (!produto) {
      return res.status(404).json({ error: `Produto ${item.id} não encontrado.` });
    }

    if (String(produto.supermercado) !== String(supermercado._id)) {
      return res.status(400).json({ error: "Todos os produtos devem pertencer ao mesmo supermercado." });
    }

    if (produto.stock < quantidade) {
      return res.status(400).json({ error: `Stock insuficiente para ${produto.nome}.` });
    }

    produto.stock -= quantidade;
    await produto.save();

    produtosVenda.push({ produto: produto._id, quantidade });
    total += produto.preco * quantidade;
  }

  const custoEntrega = parseNumber(supermercado.custoEntrega) || 0;
  total += custoEntrega;
  total = Number(total.toFixed(2));

  const novaVenda = new Venda({
    produtos: produtosVenda,
    total,
    tipoEntrega,
    metodoEntrega: supermercado.metodoEntrega || "Entregador",
    custoEntrega,
    estadoEntrega: "pendente",
    cliente: cliente._id,
    supermercado: supermercado._id
  });

  await novaVenda.save();
  return res.status(201).json({ message: "Encomenda registada.", pedido: novaVenda });
}

async function listarEncomendas(req, res) {
  const email = String(req.query.email || "").trim();
  if (!email) {
    return res.status(400).json({ error: "É necessário fornecer o email do cliente." });
  }

  const cliente = await User.findOne({ email });
  if (!cliente) {
    return res.json([]);
  }

  const vendas = await Venda.find({ cliente: cliente._id })
    .populate("cliente", "nome email")
    .populate("supermercado")
    .populate("produtos.produto")
    .sort({ createdAt: -1 });

  return res.json(vendas);
}

module.exports = {
  listarSupermercados,
  detalheSupermercado,
  listarCategorias,
  listarProdutos,
  criarEncomenda,
  listarEncomendas
};
