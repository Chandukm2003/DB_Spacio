// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
  
      // Add this line:
      console.log('✅ Authenticated user:', req.user);
  
      next();
    } catch (error) {
      console.error('❌ Invalid token:', error.message);
      return res.status(400).json({ message: 'Invalid token.' });
    }
  };
  
// Middleware to check if user is admin
const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Middleware to check if user is manager
const authorizeManager = (req, res, next) => {
    console.log('🔒 AuthorizeManager: Role =', req.user?.role);
  
    if (req.user?.role !== 'Manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }
  
    next();
  };
  
module.exports = { authenticateJWT, authorizeAdmin, authorizeManager };
