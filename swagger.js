const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Marketplace Frontoffice API",
      version: "1.0.0",
      description: "APIs REST para o frontoffice Angular do Marketplace de Supermercados"
    },
    servers: [
      {
        url: "http://localhost:3000/api"
      }
    ]
  },
  apis: ["./routes/apiRoutes.js"]
};

module.exports = swaggerJSDoc(options);
