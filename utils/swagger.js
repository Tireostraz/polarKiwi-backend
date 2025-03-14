import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth API',
            version: '1.0.0',
            description: 'Документация для API для аутентификации (регистрация и логин)',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
    },
    apis: ['./routes/auth.js'], // файл с роутами
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};