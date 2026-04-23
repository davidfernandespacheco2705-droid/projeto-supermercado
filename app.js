const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Produto = require("./models/Produto");
const Supermercado = require("./models/Supermercado");
const User = require("./models/user");
const Venda = require("./models/Venda");
const Categoria = require("./models/Categoria");

const app = express();

// CONFIGURAÇÃO BASE
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));

const JWT_SECRET = "segredo_jwt_supermercado";

function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.redirect("/login");
  }
}

function authAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.send("Acesso negado.");
  }
  next();
}

function authSupermercado(req, res, next) {
  if (!req.user || req.user.role !== "supermercado") {
    return res.send("Acesso negado.");
  }
  next();
}


// LIGA À BASE DE DADOS
mongoose.connect("mongodb://127.0.0.1:27017/supermarketDB")
  .then(() => console.log("MongoDB ligado"))
  .catch(err => console.log(err));

// MOSTRA A HOME
app.get("/", (req, res) => {
  res.redirect("/login");
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
  })
    .populate("supermercado")
    .populate("categoria");

  res.render("produtos/index", { produtos, pesquisa });
});

// ADMIN - VER TODOS OS PRODUTOS
app.get("/admin/produtos", auth, authAdmin, async (req, res) => {
  const produtos = await Produto.find()
    .populate("supermercado")
    .populate("categoria");

  res.render("admin/produtos", { produtos });
});

// MOSTRA O FORMULÁRIO DE NOVO PRODUTO
app.get("/produtos/novo", auth, authSupermercado, async (req, res) => {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });
  const categorias = await Categoria.find();

  if (!supermercado) {
    return res.send("Ainda não tens um supermercado aprovado.");
  }

  res.render("produtos/novo", {
    supermercado,
    categorias
  });
});

// GUARDA UM NOVO PRODUTO
app.post("/produtos", auth, authSupermercado, async (req, res) => {
  const { nome, descricao, categoria, preco, imagem, stock } = req.body;

  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id, aprovado: true });

  if (!supermercado) {
    return res.send("O teu supermercado ainda não está aprovado.");
  }

  const novaCategoria = await Categoria.findById(categoria);

  if (!novaCategoria) {
    return res.send("Categoria inválida.");
  }

  if (preco < 0) {
    return res.send("O preço não pode ser negativo.");
  }

  if (stock < 0) {
    return res.send("O stock não pode ser negativo.");
  }

  const novoProduto = new Produto({
    nome,
    descricao,
    categoria,
    preco,
    imagem,
    stock,
    supermercado: supermercado._id
  });

  await novoProduto.save();
  res.redirect("/supermercado/dashboard");
});

// MOSTRA O FORMULÁRIO DE EDITAR PRODUTO
app.post("/produtos/:id/editar", auth, authSupermercado, async (req, res) => {
  const { nome, descricao, categoria, preco, imagem, stock } = req.body;

  const produto = await Produto.findById(req.params.id);
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

  const categoriaExiste = await Categoria.findById(categoria);

  if (!categoriaExiste) {
    return res.send("Categoria inválida.");
  }

  if (preco < 0) {
    return res.send("O preço não pode ser negativo.");
  }

  if (stock < 0) {
    return res.send("O stock não pode ser negativo.");
  }

  await Produto.findByIdAndUpdate(req.params.id, {
    nome,
    descricao,
    categoria,
    preco,
    imagem,
    stock
  });

  res.redirect("/supermercado/dashboard");
});

// GUARDA AS ALTERAÇÕES DO PRODUTO
app.post("/produtos/:id/editar", auth, authSupermercado, async (req, res) => {
  const { nome, descricao, categoria, preco, imagem, stock } = req.body;

  const produto = await Produto.findById(req.params.id);
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

  const categoriaExiste = await Categoria.findById(categoria);

  if (!categoriaExiste) {
    return res.send("Categoria inválida.");
  }

  await Produto.findByIdAndUpdate(req.params.id, {
    nome,
    descricao,
    categoria,
    preco,
    imagem,
    stock
  });

  res.redirect("/supermercado/dashboard");
});

// APAGA UM PRODUTO
app.post("/produtos/:id/apagar", auth, authSupermercado, async (req, res) => {
  const produto = await Produto.findById(req.params.id);
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

  await Produto.findByIdAndDelete(req.params.id);
  res.redirect("/supermercado/dashboard");
});

// COMPARAR PREÇOS DE UM PRODUTO
app.get("/comparar", auth, async (req, res) => {
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

  res.render("produtos/comparar", { produtos, pesquisa });
});

// ==================== SUPERMERCADOS ====================

// LISTA SUPERMERCADOS
app.get("/supermercados", async (req, res) => {
  const supermercados = await Supermercado.find().populate("user");
  res.render("supermercados/index", { supermercados });
});

// MOSTRA O FORMULÁRIO DE NOVO SUPERMERCADO
app.get("/supermercados/novo", auth, (req, res) => {
  if (req.user.role !== "supermercado") {
    return res.send("Só utilizadores com role supermercado podem criar supermercado.");
  }

  res.render("supermercados/novo");
});

// GUARDA UM NOVO SUPERMERCADO
app.post("/supermercados", auth, async (req, res) => {
  if (req.user.role !== "supermercado") {
    return res.send("Só utilizadores com role supermercado podem criar supermercado.");
  }

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
  res.redirect("/dashboard");
});

// MOSTRA O FORMULÁRIO DE EDITAR SUPERMERCADO
app.get("/supermercados/:id/editar", auth, authSupermercado, async (req, res) => {
  const supermercado = await Supermercado.findById(req.params.id);

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  if (String(supermercado.user) !== String(req.user.id)) {
    return res.send("Acesso negado.");
  }

  res.render("supermercados/editar", { supermercado });
});

// GUARDA AS ALTERAÇÕES DO SUPERMERCADO
app.post("/supermercados/:id/editar", auth, authSupermercado, async (req, res) => {
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

  res.redirect("/supermercado/dashboard");
});

// APAGA UM SUPERMERCADO
app.post("/supermercados/:id/apagar", auth, authSupermercado, async (req, res) => {
  const supermercado = await Supermercado.findById(req.params.id);

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  if (String(supermercado.user) !== String(req.user.id)) {
    return res.send("Acesso negado.");
  }

  await Supermercado.findByIdAndDelete(req.params.id);
  res.redirect("/dashboard");
});

// APROVA UM SUPERMERCADO
app.post("/supermercados/:id/aprovar", auth, authAdmin, async (req, res) => {
  await Supermercado.findByIdAndUpdate(req.params.id, {
    aprovado: true
  });

  res.redirect("/admin/dashboard");
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
  res.redirect("/login");
});

// ==================== LOGIN ====================

// MOSTRA A PÁGINA DE LOGIN
app.get("/login", (req, res) => {
  res.render("users/login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("username recebido:", username);
  console.log("password recebida:", password);

  const user = await User.findOne({ username, password });

  console.log("user encontrado:", user);

  if (!user) {
    return res.send("Login inválido");
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true
  });

  res.redirect("/dashboard");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get("/dashboard", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.clearCookie("token");
    return res.redirect("/login");
  }

  if (user.role === "admin") {
    return res.redirect("/admin/dashboard");
  }

  if (user.role === "supermercado") {
    const supermercado = await Supermercado.findOne({ user: user._id });

if (!supermercado) {
  return res.redirect("/supermercados/novo");
}

    if (!supermercado.aprovado) {
      return res.send("O teu supermercado está registado, mas ainda não foi aprovado por um admin.");
    }

    return res.redirect("/supermercado/dashboard");
  }

  return res.send("Não tens dashboard disponível.");
});

app.get("/admin/dashboard", auth, authAdmin, async (req, res) => {
  const user = await User.findById(req.user.id);

  const supermercadosPendentes = await Supermercado.find({ aprovado: false }).populate("user");
  const supermercadosAprovados = await Supermercado.find({ aprovado: true }).populate("user");

  res.render("admin/dashboard", {
    user,
    supermercadosPendentes,
    supermercadosAprovados
  });
});

app.get("/supermercado/dashboard", auth, authSupermercado, async (req, res) => {
  const user = await User.findById(req.user.id);
  const supermercado = await Supermercado.findOne({ user: user._id });

  if (!supermercado) {
    return res.send("Ainda não tens supermercado associado.");
  }

  if (!supermercado.aprovado) {
    return res.send("O teu supermercado ainda não foi aprovado por um admin.");
  }

  const produtos = await Produto.find({
    supermercado: supermercado._id
  });

  res.render("supermercados/dashboard", {
    user,
    supermercado,
    produtos
  });
});

// MOSTRA O PERFIL
app.get("/perfil", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

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

// ==================== ADMIN ====================

// VER DETALHES DO SUPERMERCADO (ADMIN)
app.get("/admin/supermercados/:id", auth, authAdmin, async (req, res) => {
  const supermercado = await Supermercado.findById(req.params.id).populate("user");

  if (!supermercado) {
    return res.send("Supermercado não encontrado.");
  }

  res.render("admin/detalhe-supermercado", { supermercado });
});

// REJEITAR SUPERMERCADO
app.post("/supermercados/:id/rejeitar", auth, authAdmin, async (req, res) => {
  await Supermercado.findByIdAndUpdate(req.params.id, {
    aprovado: false
  });

  res.redirect("/admin/dashboard");
});

app.get("/admin/supermercados", auth, authAdmin, async (req, res) => {
  const supermercadosPendentes = await Supermercado.find({ aprovado: false }).populate("user");
  const supermercadosAprovados = await Supermercado.find({ aprovado: true }).populate("user");

  res.render("admin/supermercados", {
    supermercadosPendentes,
    supermercadosAprovados
  });
});

app.get("/admin/produtos", auth, authAdmin, async (req, res) => {
  const produtos = await Produto.find().populate("supermercado");

  res.render("admin/produtos", { produtos });
});

// LISTA AS VATEGORIAS
app.get("/admin/categorias", auth, authAdmin, async (req, res) => {
  const categorias = await Categoria.find();
  res.render("admin/categorias", { categorias });
});

// CRIA NOVA CATEGORIA
app.get("/admin/categorias/nova", auth, authAdmin, (req, res) => {
  res.render("admin/nova-categoria");
});

// GUARDA A CATEGORIA
app.post("/admin/categorias", auth, authAdmin, async (req, res) => {
  const { nome } = req.body;

  const novaCategoria = new Categoria({ nome });
  await novaCategoria.save();

  res.redirect("/admin/categorias");

// EDITA A CATEGORIA
app.get("/admin/categorias/:id/editar", auth, authAdmin, async (req, res) => {
  const categoria = await Categoria.findById(req.params.id);
  res.render("admin/editar-categoria", { categoria });
});
app.post("/admin/categorias/:id/editar", auth, authAdmin, async (req, res) => {
  const { nome } = req.body;

  await Categoria.findByIdAndUpdate(req.params.id, { nome });
  res.redirect("/admin/categorias");
});

// APAGA A CATEGORIA
app.post("/admin/categorias/:id/apagar", auth, authAdmin, async (req, res) => {
  await Categoria.findByIdAndDelete(req.params.id);
  res.redirect("/admin/categorias");
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
