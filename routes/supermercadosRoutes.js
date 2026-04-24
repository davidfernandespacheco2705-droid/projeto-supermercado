const express = require("express");
const supermercadosController = require("../controllers/supermercadosController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/supermercados", supermercadosController.listar);

router.get("/supermercados/novo", requireRole("supermercado"), supermercadosController.novoForm);
router.post("/supermercados", requireRole("supermercado"), supermercadosController.criar);
router.get("/supermercados/:id/editar", requireRole("supermercado"), supermercadosController.editarForm);
router.post("/supermercados/:id/editar", requireRole("supermercado"), supermercadosController.atualizar);
router.post("/supermercados/:id/apagar", requireRole("supermercado"), supermercadosController.apagar);

router.post("/supermercados/:id/aprovar", requireRole("admin"), supermercadosController.aprovar);
router.post("/supermercados/:id/rejeitar", requireRole("admin"), supermercadosController.rejeitar);

router.get("/supermercado/dashboard", requireRole("supermercado"), supermercadosController.dashboard);
router.get("/supermercado/clientes", requireRole("supermercado"), supermercadosController.clientes);
router.get("/supermercado/encomendas", requireRole("supermercado"), supermercadosController.encomendas);

module.exports = router;

