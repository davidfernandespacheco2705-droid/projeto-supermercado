function requireRole(...roles) {
  return function requireRoleMiddleware(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.send("Acesso negado.");
    }

    return next();
  };
}

module.exports = requireRole;

