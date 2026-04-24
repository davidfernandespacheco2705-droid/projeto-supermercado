const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const { MONGO_URI } = require("./config");
const sessionMiddleware = require("./middleware/session");
const authGate = require("./middleware/authGate");

const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const produtosRoutes = require("./routes/produtosRoutes");
const supermercadosRoutes = require("./routes/supermercadosRoutes");
const vendasRoutes = require("./routes/vendasRoutes");
const estafetaRoutes = require("./routes/estafetaRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// CONFIGURAÇÃO BASE
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));

// Sessão (JWT -> res.locals.session)
app.use(sessionMiddleware);

// Gate global: bloqueia rotas sem login
app.use(authGate);

// ROTAS
app.use(indexRoutes);
app.use(authRoutes);
app.use(usersRoutes);
app.use(produtosRoutes);
app.use(supermercadosRoutes);
app.use(vendasRoutes);
app.use(estafetaRoutes);
app.use(adminRoutes);

// LIGA À BASE DE DADOS + SERVIDOR
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB ligado");
    app.listen(3000, () => {
      console.log("Servidor a correr em http://localhost:3000");
    });
  })
  .catch(err => console.log(err));
