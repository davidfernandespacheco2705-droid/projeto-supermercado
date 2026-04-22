// IMPORTA O EXPRESS
const express = require("express");

// IMPORTA O MONGOOSE
const mongoose = require("mongoose");

// IMPORTA O PATH
const path = require("path");

// IMPORTA OS MODELS
const Produto = require("./models/Produto");
const Supermercado = require("./models/Supermercado");
const User = require("./models/user");
const Venda = require("./models/Venda");

// CRIA A APLICAÇÃO
const app = express();

// CONFIGURAÇÃO BASE
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));

const session = require("express-session");

app.use(session({
  secret: "segredo",
  resave: false,
  saveUninitialized: false
}));

// LIGA À BASE DE DADOS
mongoose.connect("mongodb://127.0.0.1:27017/supermarketDB")
  .then(() => console.log("MongoDB ligado"))
  .catch(err => console.log(err));

// MOSTRA A HOME
app.get("/", (req, res) => {
  res.render("index");
});

// TESTA A BASE DE DADOS
app.get("/test-db", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

// ==================== PRODUTOS ====================

// LISTA PRODUTOS
app.get("/produtos", async (req, res) => {
  const pesquisa = req.query.pesquisa || "";

  const produtos = await Produto.find({
    nome: { $regex: pesquisa, $options: "i" }
  }).populate("supermercado");

  res.render("produtos/index", { produtos, pesquisa });
});

// MOSTRA O FORMULÁRIO DE NOVO PRODUTO
app.get("/produtos/novo", async (req, res) => {
  const supermercados = await Supermercado.find();
  res.render("produtos/novo", { supermercados });
});

// GUARDA UM NOVO PRODUTO
app.post("/produtos", async (req, res) => {
  const { nome, descricao, categoria, preco, imagem, stock, supermercado } = req.body;

  const sup = await Supermercado.findById(supermercado);

  // VERIFICA SE O SUPERMERCADO ESTÁ APROVADO
  if (!sup || !sup.aprovado) {
    return res.send("O supermercado ainda não está aprovado.");
  }

  const novoProduto = new Produto({
    nome,
    descricao,
    categoria,
    preco,
    imagem,
    stock,
    supermercado
  });

  await novoProduto.save();
  res.redirect("/produtos");
});

// MOSTRA O FORMULÁRIO DE EDITAR PRODUTO
app.get("/produtos/:id/editar", async (req, res) => {
  const produto = await Produto.findById(req.params.id);
  const supermercados = await Supermercado.find();

  res.render("produtos/editar", { produto, supermercados });
});

// GUARDA AS ALTERAÇÕES DO PRODUTO
app.post("/produtos/:id/editar", async (req, res) => {
  const { nome, descricao, categoria, preco, imagem, stock, supermercado } = req.body;

  await Produto.findByIdAndUpdate(req.params.id, {
    nome,
    descricao,
    categoria,
    preco,
    imagem,
    stock,
    supermercado
  });

  res.redirect("/produtos");
});

// APAGA UM PRODUTO
app.post("/produtos/:id/apagar", async (req, res) => {
  await Produto.findByIdAndDelete(req.params.id);
  res.redirect("/produtos");
});

// COMPARAr PREÇOS DE UM PRODUTO
app.get("/comparar", async (req, res) => {
  const pesquisa = req.query.pesquisa || "";

  let produtos = [];

  if (pesquisa) {
    produtos = await Produto.find({
      nome: { $regex: pesquisa, $options: "i" }
    }).populate("supermercado");
  }

  res.render("produtos/comparar", { produtos, pesquisa });
});

// ==================== SUPERMERCADOS ====================

// LISTA SUPERMERCADOS
app.get("/supermercados", async (req, res) => {
  const supermercados = await Supermercado.find();
  res.render("supermercados/index", { supermercados });
});

// MOSTRA O FORMULÁRIO DE NOVO SUPERMERCADO
app.get("/supermercados/novo", (req, res) => {
  res.render("supermercados/novo");
});

// GUARDA UM NOVO SUPERMERCADO
app.post("/supermercados", async (req, res) => {
  const { nome, descricao, localizacao, horario, metodoEntrega, custoEntrega } = req.body;

  const novoSupermercado = new Supermercado({
    nome,
    descricao,
    localizacao,
    horario,
    metodoEntrega,
    custoEntrega,
    aprovado: false,
    user: req.session.user._id // LIGA AO USER
  });

  await novoSupermercado.save();
  res.redirect("/supermercados");
});

// MOSTRA O FORMULÁRIO DE EDITAR SUPERMERCADO
app.get("/supermercados/:id/editar", async (req, res) => {
  const supermercado = await Supermercado.findById(req.params.id);
  res.render("supermercados/editar", { supermercado });
});

// GUARDA AS ALTERAÇÕES DO SUPERMERCADO
app.post("/supermercados/:id/editar", async (req, res) => {
  const { nome, descricao, localizacao, horario, metodoEntrega, custoEntrega } = req.body;

  await Supermercado.findByIdAndUpdate(req.params.id, {
    nome,
    descricao,
    localizacao,
    horario,
    metodoEntrega,
    custoEntrega
  });

  res.redirect("/supermercados");
});

// APAGA UM SUPERMERCADO
app.post("/supermercados/:id/apagar", async (req, res) => {
  await Supermercado.findByIdAndDelete(req.params.id);
  res.redirect("/supermercados");
});

// APROVA UM SUPERMERCADO
app.post("/supermercados/:id/aprovar", async (req, res) => {
  await Supermercado.findByIdAndUpdate(req.params.id, {
    aprovado: true
  });

  res.redirect("/supermercados");
});

// ==================== USERS ====================

// MOSTRA O FORMULÁRIO DE NOVO UTILIZADOR
app.get("/users/novo", (req, res) => {
  res.render("users/novo");
});

// GUARDA UM NOVO UTILIZADOR
app.post("/users", async (req, res) => {
  const { nome, username, email, password, morada, telefone, role } = req.body;

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
  res.redirect("/");
});

// ==================== LOGIN ====================

function auth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// MOSTRA A PÁGINA DE LOGIN
app.get("/login", (req, res) => {
  res.render("users/login");
});

// VERIFICA O LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user) {
    return res.send("Login inválido");
  }

  req.session.user = user;
  res.redirect("/perfil");
});

//MOSTRA O PERFIL 
app.get("/perfil", auth, async (req, res) => {
  const user = await User.findById(req.session.user._id);

  let vendas = [];
  let supermercadosPendentes = [];
  let produtos = [];

  if (user.role === "cliente") {
    vendas = await Venda.find({ cliente: user._id }).populate("produtos.produto");
  }

  if (user.role === "admin") {
    supermercadosPendentes = await Supermercado.find({ aprovado: false });
  }

  if (user.role === "supermercado") {
    const supermercadoDoUser = await Supermercado.findOne({ user: user._id });

    if (supermercadoDoUser) {
      produtos = await Produto.find({
        supermercado: supermercadoDoUser._id
      });
    }
  }

  res.render("users/perfil", {
    user,
    vendas,
    supermercadosPendentes,
    produtos
  });
});
// ==================== VENDAS ====================

// MOSTRA O FORMULÁRIO DE NOVA VENDA
app.get("/vendas/nova", async (req, res) => {
  const produtos = await Produto.find();
  res.render("vendas/nova", { produtos });
});

// GUARDA UMA NOVA VENDA
app.post("/vendas", async (req, res) => {
  const { cliente_nome, cliente_email } = req.body;
  const quantidades = req.body.quantidades;

  // PROCURA O CLIENTE
  let cliente = await User.findOne({ email: cliente_email });

  // CRIA O CLIENTE SE NÃO EXISTIR
  if (!cliente) {
    cliente = new User({
      nome: cliente_nome,
      email: cliente_email,
      password: "1234",
      role: "cliente"
    });

    await cliente.save();
  }

  let produtosVenda = [];
  let total = 0;

  // PERCORRE OS PRODUTOS DA VENDA
  for (let produtoId in quantidades) {
    const quantidade = parseInt(quantidades[produtoId]);

    // VERIFICA SE A QUANTIDADE É MAIOR QUE ZERO
    if (quantidade > 0) {
      const produto = await Produto.findById(produtoId);

      // ADICIONA O PRODUTO À VENDA
      produtosVenda.push({
        produto: produtoId,
        quantidade
      });

      // CALCULA O TOTAL
      total += produto.preco * quantidade;

      // VERIFICA O STOCK
      if (produto.stock >= quantidade) {
        produto.stock -= quantidade;
        await produto.save();
      } else {
        return res.send("Stock insuficiente para o produto: " + produto.nome);
      }
    }
  }

  // AJUSTA O TOTAL
  total = Number(total.toFixed(2));

  // GUARDA UMA NOVA VENDA
  const novaVenda = new Venda({
    produtos: produtosVenda,
    total,
    cliente: cliente._id
  });

  await novaVenda.save();

  res.redirect("/vendas");
});

// ==================== HISTÓRICO DE VENDAS ====================

// LISTA VENDAS
app.get("/vendas", async (req, res) => {
  const vendas = await Venda.find()
    .populate("cliente")
    .populate("produtos.produto");

  res.render("vendas/index", { vendas });
});

// ==================== SERVIDOR ====================

// INICIA O SERVIDOR
app.listen(3000, () => {
  console.log("Servidor a correr em http://localhost:3000");
});
