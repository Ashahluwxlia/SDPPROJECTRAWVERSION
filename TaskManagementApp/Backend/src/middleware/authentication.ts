import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest } from '../types/express';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    
    // Attach user to request
    (req as AuthenticatedRequest).user = user;
    
    // Continue to next middleware
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
};