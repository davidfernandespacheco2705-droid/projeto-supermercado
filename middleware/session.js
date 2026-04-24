const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function sessionMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    res.locals.session = null;
    return next();
  }

  try {
    res.locals.session = jwt.verify(token, JWT_SECRET);
  } catch {
    res.locals.session = null;
  }

  return next();
}

module.exports = sessionMiddleware;

