const User = require('../models/User');

// Middleware to check if user has required role
module.exports = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Get user from database
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user role is in the allowed roles
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Access denied: You do not have permission to perform this action' 
        });
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Role auth middleware error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};