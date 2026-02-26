import { User, IUser } from './user.model';
import cloudinary from '../../config/cloudinary';
import { Readable } from 'stream';
import argon2 from 'argon2';

export const UserService = {
  async getAllUsers() {
    return await User.find().select('-password');
  },

  async updateUserRole(id: string, role: string) {
    if (!['user', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    }
    return await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  },

  async uploadAvatar(userId: string, fileBuffer: Buffer) {
    // 1. Upload to Cloudinary
    const uploadStream = (buffer: Buffer): Promise<{ secure_url: string }> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars' },
          (error, result) => {
             if (error) return reject(error);
             if (!result) return reject(new Error('Cloudinary upload failed'));
             resolve(result);
          }
        );
        Readable.from(buffer).pipe(stream);
      });
    };

    const result = await uploadStream(fileBuffer);

    // 2. Update User
    return await User.findByIdAndUpdate(
        userId,
        { avatar: result.secure_url },
        { new: true }
    ).select('-password');
  },

  async getUserById(id: string) {
    return await User.findById(id).select('-password');
  },

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
     return await User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  },

  async changePassword(userId: string, oldPass: string, newPass: string) {
     const user = await User.findById(userId);
     if (!user || !user.password) throw new Error('User not found');

     const valid = await argon2.verify(user.password, oldPass);
     if (!valid) throw new Error('Invalid old password');

     const hash = await argon2.hash(newPass);
     user.password = hash;
     await user.save();
     return true;
  },

  async adminResetPassword(userId: string, newPass: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const hash = await argon2.hash(newPass);
    user.password = hash;
    await user.save();
    return true;
  },

  async deleteAvatar(userId: string) {
    // Optional: Delete from Cloudinary if we stored the public_id.
    // For now, just clear the URL.
    return await User.findByIdAndUpdate(
        userId,
        { $unset: { avatar: 1 } },
        { new: true }
    ).select('-password');
  },

  async deleteUser(userId: string) {
    return await User.findByIdAndDelete(userId);
  }
};
