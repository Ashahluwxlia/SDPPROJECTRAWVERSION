import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Task } from '../models/Task';
import { validate } from '../middleware/validate';

export class TaskController {
  static async getAllTasks(req: Request, res: Response) {
    try {
      const tasks = await AppDataSource.getRepository(Task).find();
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
  }

  static async createTask(req: Request, res: Response) {
    try {
      const task = AppDataSource.getRepository(Task).create(req.body);
      await AppDataSource.getRepository(Task).save(task);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Failed to create task' });
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskRepository = AppDataSource.getRepository(Task);  // Changed from getRepository to AppDataSource.getRepository
      const taskId = parseInt(req.params.id, 10);
      
      if (isNaN(taskId)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
        return;
      }

      const task = await taskRepository.findOne({ where: { id: taskId } });
      
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      taskRepository.merge(task, req.body);
      await taskRepository.save(task);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskRepository = AppDataSource.getRepository(Task);  // Changed from getRepository to AppDataSource.getRepository
      const taskId = parseInt(req.params.id, 10);
      
      if (isNaN(taskId)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
        return;
      }

      const result = await taskRepository.delete(taskId);
      
      if (result.affected === 0) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}