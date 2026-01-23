import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { User, IUser } from '../user/user.model';
import { RefreshToken } from './refreshToken.model';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'superrefreshsecret';

export class AuthService {
  static async register(email: string, password: string, name: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    return user;
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password!, password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  static async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: string };
      const tokenDoc = await RefreshToken.findOne({ userId: payload.userId, token: refreshToken });

      if (!tokenDoc) {
        throw new Error('Invalid refresh token');
      }

      // Rotate: Delete old, create new
      await RefreshToken.deleteOne({ _id: tokenDoc._id });

      const user = await User.findById(payload.userId);
      if (!user) throw new Error('User not found');

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(refreshToken: string) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  private static async generateTokens(user: any) {
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    };
  }
}
