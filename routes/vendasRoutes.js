const express = require("express");
const vendasController = require("../controllers/vendasController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/vendas/nova", requireRole("supermercado"), vendasController.novaForm);
router.post("/vendas", requireRole("supermercado"), vendasController.criar);
router.get("/vendas", requireRole("supermercado"), vendasController.listar);

module.exports = router;

