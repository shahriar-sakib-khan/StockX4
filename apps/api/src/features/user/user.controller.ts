import { Request, Response } from 'express';
import { UserService } from './user.service';

export const UserController = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  },

  updateUserRole: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
          return res.status(400).json({ message: 'Role is required' });
      }

      const user = await UserService.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to update role' });
    }
  },

  uploadAvatar: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = (req as any).user.userId;
      const user = await UserService.uploadAvatar(userId, req.file.buffer);

      res.json(user);
    } catch (error: any) {
       console.error(error);
       res.status(500).json({ message: error.message || 'Upload failed' });
    }
  },

  deleteAvatar: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const user = await UserService.deleteAvatar(userId);
      res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Delete failed' });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const user = await UserService.updateProfile(userId, req.body);
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  },

  changePassword: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { oldPassword, newPassword } = req.body;
      await UserService.changePassword(userId, oldPassword, newPassword);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  },

  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  },

  adminResetPassword: async (req: Request, res: Response) => {
    try {
      // Admin only (enforced by route)
      const { newPassword } = req.body;
      await UserService.adminResetPassword(req.params.id, newPassword);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  },

  deleteSelf: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      await UserService.deleteUser(userId);
      res.json({ success: true, message: 'Account deleted' });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  },

  deleteUserById: async (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const targetUser = await UserService.getUserById(targetId);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });
        if (targetUser.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin' });

        await UserService.deleteUser(targetId);
        res.json({ success: true, message: 'User deleted' });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
  },
};
