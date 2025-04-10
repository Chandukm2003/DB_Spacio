const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/admin');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // 🔥 Create this file (I'll guide you below)

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // ✅ Logger that prints each request to console

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/admin', adminRoutes);

// Swagger Docs Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root Route
app.get('/', (req, res) => {
  res.send('Employment Registration API Running!');
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
