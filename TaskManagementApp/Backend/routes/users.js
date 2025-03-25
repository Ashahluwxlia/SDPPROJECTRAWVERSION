const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all users (admin/manager only)
router.get('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Regular users can only access their own profile
    if (req.userId !== req.params.id) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    // Users can only update their own profile unless they're admin
    if (req.userId !== req.params.id) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update allowed fields
    const { name, email } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    // Only admin can update role
    if (req.body.role) {
      const currentUser = await User.findById(req.userId);
      if (currentUser.role === 'admin') {
        user.role = req.body.role;
      }
    }
    
    await user.save();
    
    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/:id/password', auth, async (req, res) => {
  try {
    // Users can only change their own password
    if (req.userId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user tasks
router.get('/:id/tasks', auth, async (req, res) => {
  try {
    // Regular users can only access their own tasks
    if (req.userId !== req.params.id) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const tasks = await Task.find({
      $or: [
        { createdBy: req.params.id },
        { assignedTo: req.params.id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    // Update tasks created by this user
    await Task.updateMany(
      { createdBy: req.params.id },
      { $set: { createdBy: req.userId } }
    );
    
    // Update tasks assigned to this user
    await Task.updateMany(
      { assignedTo: req.params.id },
      { $unset: { assignedTo: 1 } }
    );
    
    await user.remove();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;