const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Supermercado = require("../models/Supermercado");
const { JWT_SECRET } = require("../config");

async function showLogin(req, res) {
  return res.render("users/login", { error: null });
}

async function login(req, res) {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "").trim();

  if (!username || !password) {
    return res.status(400).render("users/login", { error: "Preenche username/email e password." });
  }

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
    password
  });

  if (!user) {
    return res.status(401).render("users/login", { error: "Login inválido" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, { httpOnly: true });
  return res.redirect("/dashboard");
}

async function logout(req, res) {
  res.clearCookie("token");
  return res.redirect("/login");
}

async function dashboard(req, res) {
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

  if (user.role === "estafeta") {
    return res.redirect("/estafeta/dashboard");
  }

  if (user.role === "cliente") {
    return res.redirect("/perfil");
  }

  return res.send("Não tens dashboard disponível.");
}

module.exports = {
  showLogin,
  login,
  logout,
  dashboard
};
