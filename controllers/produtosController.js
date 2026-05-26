const Categoria = require("../models/Categoria");
const Produto = require("../models/Produto");
const Supermercado = require("../models/Supermercado");
const User = require("../models/User");

async function listar(req, res) {
  const pesquisa = req.query.pesquisa || "";

  const produtos = await Produto.find({
    nome: { $regex: pesquisa, $options: "i" }
  })
    .populate("supermercado")
    .populate("categoria");

  return res.render("produtos/index", { produtos, pesquisa });
}

async function listarDoSupermercado(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id });

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  const produtos = await Produto.find({ supermercado: supermercado._id }).populate("categoria");

  return res.render("supermercados/produtos", { supermercado, produtos });
}

async function novoForm(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });
  const categorias = await Categoria.find();

  if (!supermercado) {
    return res.send("Ainda não tens um supermercado aprovado.");
  }

  if (categorias.length === 0) {
    return res.send("Ainda não existem categorias. Pede a um admin para criar categorias antes de adicionares produtos.");
  }

  return res.render("produtos/novo", { supermercado, categorias });
}

async function criar(req, res) {
  try {
    const { nome, descricao, categoria, preco, imagem, stock } = req.body;

    const precoNum = Number(String(preco ?? "").replace(",", "."));
    const stockNum = Number.parseInt(String(stock ?? ""), 10);

    const user = await User.findById(req.user.id);
    const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

    if (!supermercado) {
      return res.send("O teu supermercado ainda não está aprovado.");
    }

    const categoriaExiste = await Categoria.findById(categoria);

    if (!categoriaExiste) {
      return res.send("Categoria inválida.");
    }

    if (!Number.isFinite(precoNum)) {
      return res.send("Preço inválido.");
    }

    if (precoNum < 0) {
      return res.send("O preço não pode ser negativo.");
    }

    if (!Number.isInteger(stockNum)) {
      return res.send("Stock inválido.");
    }

    if (stockNum < 0) {
      return res.send("O stock não pode ser negativo.");
    }

    const novoProduto = new Produto({
      nome,
      descricao,
      categoria,
      preco: precoNum,
      imagem,
      stock: stockNum,
      supermercado: supermercado._id
    });

    await novoProduto.save();
    return res.redirect("/supermercado/produtos");
  } catch (error) {
    console.error("Erro a guardar produto:", error);
    return res.status(500).send("Erro a guardar o produto. Verifica os dados e tenta novamente.");
  }
}

async function editarForm(req, res) {
  const produto = await Produto.findById(req.params.id);
  const categorias = await Categoria.find();
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id });

  if (!produto) {
    return res.send("Produto não encontrado.");
  }

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  if (String(produto.supermercado) !== String(supermercado._id)) {
    return res.send("Acesso negado.");
  }

  return res.render("produtos/editar", { produto, categorias, supermercado });
}

async function atualizar(req, res) {
  const { nome, descricao, categoria, preco, imagem, stock } = req.body;

  const precoNum = Number(String(preco ?? "").replace(",", "."));
  const stockNum = Number.parseInt(String(stock ?? ""), 10);

  const produto = await Produto.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

  if (!produto) {
    return res.send("Produto não encontrado.");
  }

  if (!supermercado) {
    return res.send("O teu supermercado ainda não está aprovado.");
  }

  if (String(produto.supermercado) !== String(supermercado._id)) {
    return res.send("Acesso negado.");
  }

  const categoriaExiste = await Categoria.findById(categoria);
  if (!categoriaExiste) {
    return res.send("Categoria inválida.");
  }

  if (!Number.isFinite(precoNum) || precoNum < 0) {
    return res.send("Preço inválido.");
  }

  if (!Number.isInteger(stockNum) || stockNum < 0) {
    return res.send("Stock inválido.");
  }

  await Produto.findByIdAndUpdate(req.params.id, {
    nome,
    descricao,
    categoria,
    preco: precoNum,
    imagem,
    stock: stockNum
  });

  return res.redirect("/supermercado/produtos");
}

async function apagar(req, res) {
  const produto = await Produto.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

  if (!produto) {
    return res.send("Produto não encontrado.");
  }

  if (!supermercado) {
    return res.send("O teu supermercado ainda não está aprovado.");
  }

  if (String(produto.supermercado) !== String(supermercado._id)) {
    return res.send("Acesso negado.");
  }

  await Produto.findByIdAndDelete(req.params.id);
  return res.redirect("/supermercado/produtos");
}

async function comparar(req, res) {
  if (req.user.role !== "admin" && req.user.role !== "cliente") {
    return res.send("Acesso negado.");
  }

  const pesquisa = req.query.pesquisa || "";
  let produtos = [];

  if (pesquisa) {
    produtos = await Produto.find({
      nome: { $regex: pesquisa, $options: "i" }
    })
      .populate("supermercado")
      .populate("categoria")
      .sort({ preco: 1 });
  }

  return res.render("produtos/comparar", { produtos, pesquisa });
}

module.exports = {
  listar,
  listarDoSupermercado,
  novoForm,
  criar,
  editarForm,
  atualizar,
  apagar,
  comparar
};

