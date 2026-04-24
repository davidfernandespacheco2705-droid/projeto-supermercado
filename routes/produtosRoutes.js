const express = require("express");
const produtosController = require("../controllers/produtosController");
const requireRole = require("../middleware/requireRole");
const uploadProdutoImagem = require("../middleware/uploadProdutoImagem");

const router = express.Router();

router.get("/produtos", produtosController.listar);
router.get("/comparar", requireRole("admin", "cliente"), produtosController.comparar);

router.get("/supermercado/produtos", requireRole("supermercado"), produtosController.listarDoSupermercado);
router.get("/produtos/novo", requireRole("supermercado"), produtosController.novoForm);
router.post("/produtos", requireRole("supermercado"), uploadProdutoImagem, produtosController.criar);

router.get("/produtos/:id/editar", requireRole("supermercado"), produtosController.editarForm);
router.post("/produtos/:id/editar", requireRole("supermercado"), uploadProdutoImagem, produtosController.atualizar);
router.post("/produtos/:id/apagar", requireRole("supermercado"), produtosController.apagar);

module.exports = router;
