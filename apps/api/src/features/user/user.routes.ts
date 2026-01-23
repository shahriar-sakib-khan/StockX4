import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router : Router = Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize(['admin']), UserController.getAllUsers);

// Update user role (Admin only)
router.patch('/:id/role', authenticate, authorize(['admin']), UserController.updateUserRole);

// Avatar
router.post('/me/avatar', authenticate, upload.single('avatar'), UserController.uploadAvatar);
router.delete('/me/avatar', authenticate, UserController.deleteAvatar);
router.patch('/me', authenticate, UserController.updateProfile);
router.put('/me/password', authenticate, UserController.changePassword);
router.delete('/me', authenticate, UserController.deleteSelf);

// Admin Routes
router.get('/:id', authenticate, authorize(['admin']), UserController.getUserById);
router.delete('/:id', authenticate, authorize(['admin']), UserController.deleteUserById);
router.patch('/:id/password', authenticate, authorize(['admin']), UserController.adminResetPassword);

export default router;
