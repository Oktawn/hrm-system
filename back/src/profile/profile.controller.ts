import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.interface';
import { ProfileService } from './profile.service';

const profileService = new ProfileService();

export class ProfileController {

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const profile = await profileService.getProfile(userId);
      res.status(200).json({
        message: 'Profile retrieved successfully',
        user: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const profileData = req.body;
      const updatedProfile = await profileService.updateProfile(userId, profileData);
      
      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      await profileService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

}
