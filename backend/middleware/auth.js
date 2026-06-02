const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

      // Check role and retrieve account
      if (decoded.role === 'owner') {
        req.user = await User.findById(decoded.id).select('-password');
        req.userRole = 'owner';
      } else if (decoded.role === 'student') {
        req.user = await Student.findById(decoded.id).select('-password');
        req.userRole = 'student';
      }

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403);
      return next(new Error(`User role '${req.userRole}' is not authorized to access this route`));
    }
    next();
  };
};

module.exports = { protect, authorize };
