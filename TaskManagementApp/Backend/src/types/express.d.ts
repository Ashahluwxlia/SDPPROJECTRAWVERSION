import User from '../models/User';
import 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: User;  // Note: non-optional
}