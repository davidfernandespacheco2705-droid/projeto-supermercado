// Bloqueia navegação sem login: fora de /login e criação de conta, redireciona para o login.
function authGate(req, res, next) {
  const isPublicRoute =
    req.path === "/" ||
    req.path === "/login" ||
    req.path === "/logout" ||
    req.path === "/users/novo" ||
    (req.path === "/users" && req.method === "POST");

  if (isPublicRoute) {
    return next();
  }

  if (!res.locals.session) {
    if (req.cookies?.token) {
      res.clearCookie("token");
    }

    return res.redirect("/login");
  }

  req.user = res.locals.session;

  if (req.user.role === "estafeta") {
    const isAllowed =
      req.path === "/dashboard" ||
      req.path === "/perfil" ||
      req.path === "/logout" ||
      req.path.startsWith("/estafeta/");

    if (!isAllowed) {
      return res.redirect("/estafeta/dashboard");
    }
  }

  return next();
}

module.exports = authGate;

