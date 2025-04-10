// backend/swagger.js
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employment Registration System API',
      version: '1.0.0',
      description: 'API documentation for employment registration system',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // 📌 make sure admin.js and employeeRoutes.js are inside /routes
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
