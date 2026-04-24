const User = require("../models/User");
const Venda = require("../models/Venda");

async function dashboard(req, res) {
  const user = await User.findById(req.user.id);

  const pendentes = await Venda.countDocuments({
    tipoEntrega: "domicilio",
    estadoEntrega: "pendente"
  });

  const minhasAtivas = await Venda.countDocuments({
    tipoEntrega: "domicilio",
    estafeta: user._id,
    estadoEntrega: { $in: ["aceite", "em_transito"] }
  });

  const historico = await Venda.countDocuments({
    tipoEntrega: "domicilio",
    estafeta: user._id,
    estadoEntrega: "entregue"
  });

  return res.render("estafetas/dashboard", { user, pendentes, minhasAtivas, historico });
}

async function entregasDisponiveis(req, res) {
  const vendas = await Venda.find({
    tipoEntrega: "domicilio",
    estadoEntrega: "pendente",
    estafeta: null
  })
    .populate("cliente")
    .populate("supermercado")
    .sort({ createdAt: -1 });

  return res.render("estafetas/entregas", { vendas });
}

async function aceitarEntrega(req, res) {
  const venda = await Venda.findById(req.params.id);

  if (!venda) {
    return res.send("Venda não encontrada.");
  }

  if (venda.tipoEntrega !== "domicilio" || venda.estadoEntrega !== "pendente" || venda.estafeta) {
    return res.send("Esta entrega já não está disponível.");
  }

  const estafeta = await User.findById(req.user.id);

  const alreadyActive = await Venda.findOne({
    tipoEntrega: "domicilio",
    estafeta: estafeta._id,
    estadoEntrega: { $in: ["aceite", "em_transito"] }
  });

  if (alreadyActive) {
    return res.send("Já tens uma entrega ativa. Termina a entrega atual antes de aceitares outra.");
  }

  await Venda.findByIdAndUpdate(req.params.id, {
    estadoEntrega: "aceite",
    estafeta: estafeta._id
  });

  return res.redirect("/estafeta/minhas");
}

async function minhasEntregas(req, res) {
  const estafeta = await User.findById(req.user.id);

  const vendas = await Venda.find({
    tipoEntrega: "domicilio",
    estafeta: estafeta._id,
    estadoEntrega: { $in: ["aceite", "em_transito"] }
  })
    .populate("cliente")
    .populate("supermercado")
    .sort({ updatedAt: -1 });

  return res.render("estafetas/minhas", { vendas });
}

async function atualizarEstado(req, res) {
  const estado = String(req.body?.estado || "").trim();
  const nextStates = new Set(["em_transito", "entregue"]);

  if (!nextStates.has(estado)) {
    return res.send("Estado inválido.");
  }

  const estafeta = await User.findById(req.user.id);
  const venda = await Venda.findById(req.params.id);

  if (!venda) {
    return res.send("Venda não encontrada.");
  }

  if (venda.tipoEntrega !== "domicilio") {
    return res.send("Esta venda não tem entrega ao domicílio.");
  }

  if (String(venda.estafeta) !== String(estafeta._id)) {
    return res.send("Acesso negado.");
  }

  if (venda.estadoEntrega === "entregue") {
    return res.redirect("/estafeta/historico");
  }

  if (estado === "em_transito" && venda.estadoEntrega !== "aceite") {
    return res.send("Transição inválida.");
  }

  if (estado === "entregue" && venda.estadoEntrega !== "em_transito") {
    return res.send("Transição inválida.");
  }

  await Venda.findByIdAndUpdate(req.params.id, { estadoEntrega: estado });

  if (estado === "entregue") {
    return res.redirect("/estafeta/historico");
  }

  return res.redirect("/estafeta/minhas");
}

async function historico(req, res) {
  const estafeta = await User.findById(req.user.id);

  const vendas = await Venda.find({
    tipoEntrega: "domicilio",
    estafeta: estafeta._id,
    estadoEntrega: "entregue"
  })
    .populate("cliente")
    .populate("supermercado")
    .sort({ updatedAt: -1 });

  return res.render("estafetas/historico", { vendas });
}

module.exports = {
  dashboard,
  entregasDisponiveis,
  aceitarEntrega,
  minhasEntregas,
  atualizarEstado,
  historico
};

