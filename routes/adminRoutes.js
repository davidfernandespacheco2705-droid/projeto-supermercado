const express = require("express");
const adminController = require("../controllers/adminController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.use(requireRole("admin"));

router.get("/admin/dashboard", adminController.dashboard);

router.get("/admin/users", adminController.listarUsers);
router.post("/admin/users/:id/role", adminController.atualizarRole);
router.post("/admin/users/:id/apagar", adminController.apagarUser);

router.get("/admin/supermercados", adminController.listarSupermercados);
router.get("/admin/supermercados/:id", adminController.detalheSupermercado);

router.get("/admin/produtos", adminController.listarProdutos);
router.get("/admin/vendas", adminController.listarVendas);

router.get("/admin/categorias", adminController.listarCategorias);
router.get("/admin/categorias/nova", adminController.novaCategoriaForm);
router.post("/admin/categorias", adminController.criarCategoria);
router.get("/admin/categorias/:id/editar", adminController.editarCategoriaForm);
router.post("/admin/categorias/:id/editar", adminController.atualizarCategoria);
router.post("/admin/categorias/:id/apagar", adminController.apagarCategoria);

module.exports = router;
