const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authMiddleware = {
  // Generate JWT token
  generateToken: (user) => {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  // Verify JWT token
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(400).json({ message: 'Invalid token.' });
    }
  },

  // Role-based authorization
  authorize: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Access denied. Not authenticated.' });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      
      next();
    };
  },

  // Hash password
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  // Compare password
  comparePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  }
};

module.exports = authMiddleware;