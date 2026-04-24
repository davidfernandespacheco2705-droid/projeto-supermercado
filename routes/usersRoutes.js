const express = require("express");
const usersController = require("../controllers/usersController");

const router = express.Router();

router.get("/users/novo", usersController.showRegister);
router.post("/users", usersController.register);
router.get("/perfil", usersController.perfil);

module.exports = router;

