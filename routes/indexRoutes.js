const express = require("express");
const Produto = require("../models/Produto");

const router = express.Router();

router.get("/", (req, res) => {
  return res.redirect("/login");
});

router.get("/test-db", async (req, res) => {
  const produtos = await Produto.find();
  return res.json(produtos);
});

module.exports = router;

