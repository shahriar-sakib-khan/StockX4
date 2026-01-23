import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

import { registerSchema, loginSchema } from '@repo/shared';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = registerSchema.parse(req.body);
      const user = await AuthService.register(email, password, name);
      res.status(201).json(user);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error.message === 'User already exists') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await AuthService.login(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/api/auth/refresh', // Strict path for security
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ accessToken, user });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ error: 'Unauthorized' });

      const data = await AuthService.refresh(refreshToken);

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ accessToken: data.accessToken });
    } catch (error: any) {
       // ... existing error handling
       if (error.message === 'Invalid refresh token' || error.message === 'User not found') {
         res.status(401).json({ error: 'Unauthorized' });
       } else {
         res.status(500).json({ error: 'Internal Server Error' });
       }
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
       res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
