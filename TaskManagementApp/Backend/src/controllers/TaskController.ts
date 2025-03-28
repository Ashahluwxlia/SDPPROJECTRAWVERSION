import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import { AuthenticatedRequest } from '../middleware/auth';

export class TaskController {
  static async getAllTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await Task.findAll();
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await Task.create({
        ...req.body,
        assignedToId: req.body.assignedToId || req.user.id
      });
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.id;
      
      const [updated] = await Task.update(req.body, {
        where: { id: taskId }
      });
      
      if (updated === 0) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      const updatedTask = await Task.findByPk(taskId);
      res.json({ success: true, data: updatedTask });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.id;
      
      const deleted = await Task.destroy({
        where: { id: taskId }
      });
      
      if (deleted === 0) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}