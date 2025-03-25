const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (ext) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images, PDFs, and office documents are allowed.'));
  }
});

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assignee } = req.query;
    const query = {};
    
    // Apply filters if provided
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    
    // For regular users, only show their tasks
    // For admins and managers, show all tasks or filter by assignee
    const user = await User.findById(req.userId);
    if (user.role === 'user') {
      query.$or = [
        { createdBy: req.userId },
        { assignedTo: req.userId }
      ];
    } else if (assignee && assignee !== 'all') {
      query.assignedTo = assignee;
    }
    
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overdue tasks
router.get('/overdue', auth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    };
    
    // For regular users, only show their tasks
    const user = await User.findById(req.userId);
    if (user.role === 'user') {
      query.$or = [
        { createdBy: req.userId },
        { assignedTo: req.userId }
      ];
    }
    
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to this task
    const user = await User.findById(req.userId);
    if (user.role === 'user' && 
        task.createdBy._id.toString() !== req.userId && 
        (!task.assignedTo || task.assignedTo._id.toString() !== req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, description, dueDate, priority, status, 
      tags, isRecurring, recurringPattern, assignedTo 
    } = req.body;
    
    const task = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      status: status || 'to-do',
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || 'daily',
      createdBy: req.userId,
      assignedTo: assignedTo || req.userId
    });
    
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to update this task
    const user = await User.findById(req.userId);
    if (user.role === 'user' && 
        task.createdBy.toString() !== req.userId && 
        (!task.assignedTo || task.assignedTo.toString() !== req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update task fields
    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        task[key] = updateFields[key];
      }
    });
    
    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to delete this task
    const user = await User.findById(req.userId);
    if (user.role === 'user' && task.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete any attached files
    if (task.attachments && task.attachments.length > 0) {
      task.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '../uploads', path.basename(attachment.url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    await task.remove();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to this task
    const user = await User.findById(req.userId);
    if (user.role === 'user' && 
        task.createdBy.toString() !== req.userId && 
        (!task.assignedTo || task.assignedTo.toString() !== req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const comment = {
      text,
      createdBy: req.userId
    };
    
    task.comments.push(comment);
    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('comments.createdBy', 'name email');
    
    const newComment = updatedTask.comments[updatedTask.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an attachment to a task
router.post('/:id/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      // Delete the uploaded file if task doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to this task
    const user = await User.findById(req.userId);
    if (user.role === 'user' && 
        task.createdBy.toString() !== req.userId && 
        (!task.assignedTo || task.assignedTo.toString() !== req.userId)) {
      // Delete the uploaded file if user doesn't have access
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const attachment = {
      filename: req.file.originalname,
      url: fileUrl,
      createdBy: req.userId
    };
    
    task.attachments.push(attachment);
    await task.save();
    
    res.status(201).json(attachment);
  } catch (error) {
    console.error('Add attachment error:', error);
    // Delete the uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an attachment
router.delete('/:id/attachments/:attachmentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to delete this attachment
    const user = await User.findById(req.userId);
    if (user.role === 'user' && task.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the attachment
    const attachment = task.attachments.id(req.params.attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    // Delete the file
    const filePath = path.join(__dirname, '..', attachment.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove the attachment from the task
    attachment.remove();
    await task.save();
    
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign a task to a user
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if the assignee exists
    const assignee = await User.findById(userId);
    if (!assignee) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to assign this task
    const user = await User.findById(req.userId);
    if (user.role === 'user' && task.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    task.assignedTo = userId;
    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task history (for future implementation with history tracking)
router.get('/:id/history', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to this task
    const user = await User.findById(req.userId);
    if (user.role === 'user' && 
        task.createdBy.toString() !== req.userId && 
        (!task.assignedTo || task.assignedTo.toString() !== req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // This is a placeholder for future implementation
    // In a real app, you would have a TaskHistory model to track changes
    res.json([
      {
        action: 'created',
        timestamp: task.createdAt,
        user: task.createdBy
      }
    ]);
  } catch (error) {
    console.error('Get task history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by tag
router.get('/tags/:tag', auth, async (req, res) => {
  try {
    const { tag } = req.params;
    
    const query = { tags: tag };
    
    // For regular users, only show their tasks
    const user = await User.findById(req.userId);
    if (user.role === 'user') {
      query.$or = [
        { createdBy: req.userId },
        { assignedTo: req.userId }
      ];
    }
    
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks statistics (for dashboard)
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const query = {};
    
    // For regular users, only count their tasks
    const user = await User.findById(req.userId);
    if (user.role === 'user') {
      query.$or = [
        { createdBy: req.userId },
        { assignedTo: req.userId }
      ];
    }
    
    const now = new Date();
    
    // Get total tasks count
    const totalTasks = await Task.countDocuments(query);
    
    // Get completed tasks count
    const completedTasks = await Task.countDocuments({
      ...query,
      status: 'completed'
    });
    
    // Get in-progress tasks count
    const inProgressTasks = await Task.countDocuments({
      ...query,
      status: 'in-progress'
    });
    
    // Get overdue tasks count
    const overdueTasks = await Task.countDocuments({
      ...query,
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    });
    
    // Get tasks due today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const tasksDueToday = await Task.countDocuments({
      ...query,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'completed' }
    });
    
    res.json({
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      dueToday: tasksDueToday
    });
  } catch (error) {
    console.error('Get tasks statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update tasks (for admin/manager)
router.put('/bulk/update', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { taskIds, updateData } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'Task IDs are required' });
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Update data is required' });
    }
    
    // Prevent updating sensitive fields
    const safeUpdateData = { ...updateData };
    delete safeUpdateData._id;
    delete safeUpdateData.createdBy;
    delete safeUpdateData.createdAt;
    
    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: safeUpdateData }
    );
    
    res.json({
      message: 'Tasks updated successfully',
      modifiedCount: result.nModified
    });
  } catch (error) {
    console.error('Bulk update tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;