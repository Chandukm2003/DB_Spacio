const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    console.log('[AUTH] Token received:', token); // 🔍 Debug log

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Decoded token:', decoded); // 🔍 Debug log

    req.user = decoded; // decoded contains { id, role, ... }

    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    return res.status(403).json({ message: 'Token is not valid or may have expired' });
  }
};

module.exports = authenticate;