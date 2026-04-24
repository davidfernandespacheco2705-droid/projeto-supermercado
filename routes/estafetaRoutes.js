const express = require("express");
const estafetaController = require("../controllers/estafetaController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/estafeta/dashboard", requireRole("estafeta"), estafetaController.dashboard);
router.get("/estafeta/entregas", requireRole("estafeta"), estafetaController.entregasDisponiveis);
router.post("/estafeta/entregas/:id/aceitar", requireRole("estafeta"), estafetaController.aceitarEntrega);
router.get("/estafeta/minhas", requireRole("estafeta"), estafetaController.minhasEntregas);
router.post("/estafeta/entregas/:id/estado", requireRole("estafeta"), estafetaController.atualizarEstado);
router.get("/estafeta/historico", requireRole("estafeta"), estafetaController.historico);

module.exports = router;

