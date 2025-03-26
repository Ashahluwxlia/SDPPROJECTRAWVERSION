import express from 'express';
import multer from 'multer';
import { userController } from '../controllers/userController';
import { validateProfileUpdate, validatePasswordUpdate, validate } from '../middleware/validation';
import { authenticateUser } from '../middleware/authentication';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put(
  '/profile',
  authenticateUser,
  upload.single('profilePicture'),
  validateProfileUpdate,
  validate,
  userController.updateProfile
);

router.put(
  '/password',
  authenticateUser,
  validatePasswordUpdate,
  validate,
  userController.updatePassword
);

router.get(
  '/activity',
  authenticateUser,
  userController.getActivityHistory
);

export default router;