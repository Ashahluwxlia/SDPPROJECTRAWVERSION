const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Task = require('../models/Task');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: managerPassword,
      role: 'manager'
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });

    console.log('Created users');

    // Create sample tasks
    const tasks = [
      {
        title: 'Complete project setup',
        description: 'Set up the initial project structure and dependencies',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'high',
        status: 'in-progress',
        tags: ['setup', 'important'],
        createdBy: admin._id,
        assignedTo: manager._id
      },
      {
        title: 'Design database schema',
        description: 'Create the database schema for the application',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'high',
        status: 'completed',
        tags: ['database', 'design'],
        createdBy: manager._id,
        assignedTo: manager._id
      },
      {
        title: 'Implement user authentication',
        description: 'Add user registration, login, and authentication',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        priority: 'medium',
        status: 'to-do',
        tags: ['auth', 'security'],
        createdBy: manager._id,
        assignedTo: regularUser._id
      },
      {
        title: 'Create task management UI',
        description: 'Design and implement the user interface for task management',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'medium',
        status: 'to-do',
        tags: ['frontend', 'ui'],
        createdBy: admin._id,
        assignedTo: regularUser._id
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints and their usage',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priority: 'low',
        status: 'to-do',
        tags: ['documentation'],
        createdBy: manager._id,
        assignedTo: manager._id
      }
    ];

    await Task.insertMany(tasks);
    console.log('Created sample tasks');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();