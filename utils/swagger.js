import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerSchemas } from "./swaggerschemas.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PolarKiwi API",
      version: "1.0.0",
      description: "Документация для API интернет-магазина PolarKiwi",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: swaggerSchemas,
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
