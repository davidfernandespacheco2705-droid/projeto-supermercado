module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "segredo_jwt_supermercado",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/supermarketDB"
};

