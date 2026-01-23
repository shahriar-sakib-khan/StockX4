/**
 * TEST SCENARIOS (Manifest)
 * ---------------------------------------------------
 * 1. [Register] create new user with hashed password
 * 2. [Login] return access & refresh tokens for valid credentials
 * 3. [Refresh] rotate tokens successfully for valid refresh token
 * 4. [Refresh] throw if refresh token is invalid (Security)
 * 5. [Refresh] throw if token reused/revoked (Security)
 * 6. [Logout] remove refresh token from DB
 * ---------------------------------------------------
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';
import { RefreshToken } from './refreshToken.model';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('../user/user.model');
vi.mock('./refreshToken.model');
vi.mock('argon2');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const mockUser = {
        _id: 'userid',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
      };

      (User.findOne as any).mockResolvedValue(null);
      (argon2.hash as any).mockResolvedValue('hashedpassword');
      (User.create as any).mockResolvedValue(mockUser);

      const result = await AuthService.register('test@example.com', 'password123', 'Test User');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const mockUser = {
        _id: 'userid',
        email: 'test@example.com',
        password: 'hashed_stored_password',
        role: 'user',
      };

      (User.findOne as any).mockResolvedValue(mockUser);
      (argon2.verify as any).mockResolvedValue(true);
      (jwt.sign as any)
        .mockReturnValueOnce('access_token') // First call for access token
        .mockReturnValueOnce('refresh_token'); // Second call for refresh token
      (RefreshToken.create as any).mockResolvedValue({});

      const result = await AuthService.login('test@example.com', 'password123');

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(RefreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: { id: 'userid', email: 'test@example.com', name: undefined, role: 'user' }
      });
    });
  });

  describe('refresh', () => {
    it('should rotate tokens successfully', async () => {
      const mockPayload = { userId: 'userid' };
      const mockStoredToken = { token: 'hashed_old_refresh_token', userId: 'userid' };

      (jwt.verify as any).mockReturnValue(mockPayload);
      (RefreshToken.findOne as any).mockResolvedValue(mockStoredToken);
      (argon2.verify as any).mockResolvedValue(true);
      (User.findById as any).mockResolvedValue({
        _id: 'userid',
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
        avatar: 'pic'
      });
      (jwt.sign as any)
          .mockReturnValueOnce('new_access_token')
          .mockReturnValueOnce('new_refresh_token');

      const result = await AuthService.refresh('old_refresh_token');

      expect(RefreshToken.findOne).toHaveBeenCalledWith({ userId: 'userid', token: 'old_refresh_token' });
      // Should delete old token (Rotation)
      expect(RefreshToken.deleteOne).toHaveBeenCalled();
      // Should create new token
      expect(RefreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        user: {
             id: 'userid',
             email: 'test@example.com',
             name: 'Test',
             role: 'user',
             avatar: 'pic'
        }
      });
    });

    it('should throw if token is invalid', async () => {
      (jwt.verify as any).mockImplementation(() => { throw new Error('Invalid token'); });
      await expect(AuthService.refresh('invalid')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw if token not found in DB (Reuse Detection/Revoked)', async () => {
       (jwt.verify as any).mockReturnValue({ userId: 'userid' });
       (RefreshToken.findOne as any).mockResolvedValue(null);

       await expect(AuthService.refresh('valid_jwt_but_revoked')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should remove refresh token from DB', async () => {
       (jwt.verify as any).mockReturnValue({ userId: 'userid' });
       await AuthService.logout('refresh_token');
       expect(RefreshToken.deleteOne).toHaveBeenCalled();
    });
  });
});
