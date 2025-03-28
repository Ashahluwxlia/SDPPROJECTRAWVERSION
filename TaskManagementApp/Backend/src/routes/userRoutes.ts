import express from 'express';
import multer from 'multer';
import { userController } from '../controllers/userController';
import { validateProfileUpdate, validatePasswordUpdate, validate } from '../middleware/validation';
import { authenticateUser } from '../middleware/authentication';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to convert controller methods to Express-compatible handlers
const wrapController = (handler: (req: AuthenticatedRequest, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res);
  };
};

router.put(
  '/profile',
  authenticateUser,
  upload.single('profilePicture'),
  validateProfileUpdate,
  validate,
  wrapController(userController.updateProfile)
);

router.put(
  '/password',
  authenticateUser,
  validatePasswordUpdate,
  validate,
  wrapController(userController.updatePassword)
);

router.get(
  '/activity',
  authenticateUser,
  wrapController(userController.getActivityHistory)
);

export default router;