// server.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const connectDB = require('./config/db'); // ✅ MongoDB connection file
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/admin');
const swaggerSpec = require('./swagger'); // ✅ Swagger config

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/admin', adminRoutes);

// Swagger Docs Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root Route
app.get('/', (req, res) => {
  res.send('🚀 Employment Registration API Running with MongoDB!');
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs: http://localhost:${PORT}/api-docs`);
});