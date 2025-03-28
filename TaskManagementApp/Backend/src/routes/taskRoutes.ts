import express, { Router, Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import User from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get all tasks
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await Task.findAll({
      include: [{
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'username', 'email']
      }]
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create new task
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.create({
      ...req.body,
      assignedToId: req.body.assignedToId || req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [updated] = await Task.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    const updatedTask = await Task.findByPk(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;