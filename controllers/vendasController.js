const Categoria = require("../models/Categoria");
const Produto = require("../models/Produto");
const Supermercado = require("../models/Supermercado");
const User = require("../models/User");
const Venda = require("../models/Venda");

async function novaForm(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

  if (!supermercado) {
    return res.send("Supermercado não encontrado ou não aprovado.");
  }

  const categorias = await Categoria.find();

  const produtos = await Produto.find({ supermercado: supermercado._id }).populate("categoria");

  return res.render("vendas/nova", { produtos, supermercado, categorias });
}

async function criar(req, res) {
  const { cliente_nome, cliente_email, tipoEntrega } = req.body;
  const quantidades = req.body.quantidades || {};

  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

  if (!supermercado) {
    return res.send("Supermercado não encontrado ou não aprovado.");
  }

  let cliente = await User.findOne({ email: cliente_email });

  if (!cliente) {
    cliente = new User({
      nome: cliente_nome,
      username: cliente_email,
      email: cliente_email,
      password: "1234",
      morada: "",
      telefone: "",
      role: "cliente"
    });

    await cliente.save();
  }

  const produtosVenda = [];
  let total = 0;
  let existeProdutoSelecionado = false;

  for (const produtoId of Object.keys(quantidades)) {
    const quantidade = parseInt(quantidades[produtoId], 10);

    if (quantidade > 0) {
      existeProdutoSelecionado = true;

      const produto = await Produto.findById(produtoId);

      if (!produto) {
        return res.send("Produto não encontrado.");
      }

      if (String(produto.supermercado) !== String(supermercado._id)) {
        return res.send("Acesso negado. Produto inválido para este supermercado.");
      }

      if (produto.stock < quantidade) {
        return res.send("Stock insuficiente para o produto: " + produto.nome);
      }

      produtosVenda.push({ produto: produtoId, quantidade });

      total += produto.preco * quantidade;

      produto.stock -= quantidade;
      await produto.save();
    }
  }

  if (!existeProdutoSelecionado) {
    return res.send("Tens de selecionar pelo menos um produto.");
  }

  const isEntrega = tipoEntrega === "domicilio";
  const custoEntrega = Number(supermercado.custoEntrega || 0);
  const metodoEntrega = String(supermercado.metodoEntrega || "");

  if (isEntrega && Number.isFinite(custoEntrega) && custoEntrega > 0) {
    total += custoEntrega;
  }

  total = Number(total.toFixed(2));

  const novaVenda = new Venda({
    produtos: produtosVenda,
    total,
    tipoEntrega: isEntrega ? "domicilio" : "loja",
    metodoEntrega: isEntrega ? metodoEntrega : "",
    custoEntrega: isEntrega ? custoEntrega : 0,
    estadoEntrega: isEntrega ? "pendente" : "confirmada",
    cliente: cliente._id,
    supermercado: supermercado._id
  });

  await novaVenda.save();
  return res.redirect("/vendas");
}

async function cancelar(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

  if (!supermercado) {
    return res.send("Supermercado não encontrado ou não aprovado.");
  }

  const venda = await Venda.findById(req.params.id);

  if (!venda) {
    return res.send("Venda não encontrada.");
  }

  if (String(venda.supermercado) !== String(supermercado._id)) {
    return res.send("Acesso negado.");
  }

  const createdAt = new Date(venda.createdAt).getTime();
  const prazoCancelar = 5 * 60 * 1000;
  const prazoValido = venda.createdAt && Date.now() - createdAt <= prazoCancelar;

  if (!prazoValido) {
    return res.send("Não é possível cancelar após 5 minutos.");
  }

  if (["entregue", "cancelada", "em_transito"].includes(venda.estadoEntrega)) {
    return res.send("Não é possível cancelar esta venda.");
  }

  for (const item of venda.produtos) {
    const produto = await Produto.findById(item.produto);
    if (produto) {
      produto.stock = Number(produto.stock || 0) + Number(item.quantidade || 0);
      await produto.save();
    }
  }

  await Venda.findByIdAndUpdate(req.params.id, { estadoEntrega: "cancelada" });
  return res.redirect("/vendas");
}

async function listar(req, res) {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

  if (!supermercado) {
    return res.send("Supermercado não encontrado ou não aprovado.");
  }

  const vendas = await Venda.find({ supermercado: supermercado._id })
    .populate("cliente")
    .populate("produtos.produto");

  return res.render("vendas/index", { vendas, supermercado });
}

module.exports = {
  novaForm,
  criar,
  cancelar,
  listar
};

