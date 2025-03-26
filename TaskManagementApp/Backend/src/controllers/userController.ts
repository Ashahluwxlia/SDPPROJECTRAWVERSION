import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import User from '../models/User';
import Activity from '../models/Activity';
import bcrypt from 'bcrypt';
import { NotFoundError, ValidationError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

// Auth utility functions
const validatePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Password validation failed');
  }
};

const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const userController = {
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { name, preferences } = req.body;
      const profilePicture = req.file;

      let pictureUrl: string | undefined;
      if (profilePicture) {
        const key = `profile-pictures/${userId}-${Date.now()}-${profilePicture.originalname}`;
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: profilePicture.buffer,
          ContentType: profilePicture.mimetype,
        }));
        pictureUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({
        name,
        preferences: {
          ...user.preferences,
          ...preferences,
        },
        ...(pictureUrl && { profilePicture: pictureUrl }),
      });

      await Activity.create({
        userId,
        type: 'profile',
        description: 'Updated profile information',
      });

      res.json(user);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updatePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValid = await validatePassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await hashPassword(newPassword);
      await user.update({ password: hashedPassword });

      await Activity.create({
        userId,
        type: 'profile',
        description: 'Changed password',
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  },

  async getActivityHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const activities = await Activity.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 10,
      });
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activity history' });
    }
  }
};