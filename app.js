const express = require("express");
const mongoose = require("mongoose");

const app = express();

const path = require("path");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Ligação MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/supermarketDB")
  .then(() => console.log("MongoDB ligado"))
  .catch(err => console.log(err));

// Rota teste
app.get("/", (req, res) => {
  res.send("App a funcionar");
});

const Produto = require("./models/Produto");

app.get("/test-db", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

app.get("/produtos", async (req, res) => {
  const produtos = await Produto.find();
  res.render("produtos/index", { produtos });
});

app.get("/produtos/novo", (req, res) => {
  res.render("produtos/novo");
});

app.post("/produtos", async (req, res) => {
  const { nome, preco, stock } = req.body;

  const novoProduto = new Produto({
    nome,
    preco,
    stock
  });

  await novoProduto.save();

  res.redirect("/produtos");
});

app.listen(3000, () => {
  console.log("Servidor a correr em http://localhost:3000");
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "public")));


app.get("/produtos", (req, res) => {
  res.send("Lista de produtos");
});



