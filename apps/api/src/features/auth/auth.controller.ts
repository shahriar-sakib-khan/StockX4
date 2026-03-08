import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

import { registerSchema, loginSchema } from '@repo/shared';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone } = registerSchema.parse(req.body);
      const user = await AuthService.register(email, password, name, phone);
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
    // ... logic for old login if needed, or redirect to unified
    return this.unifiedLogin(req, res);
  }

  static async unifiedLogin(req: Request, res: Response) {
      try {
          const { identifier, password } = req.body; // Using raw body or zod if preferred
          const result = await AuthService.unifiedLogin(identifier, password) as any;

          if (result.refreshToken) {
              res.cookie('refreshToken', result.refreshToken, {
                  httpOnly: true,
                  path: '/auth/refresh',
                  maxAge: 7 * 24 * 60 * 60 * 1000,
              });
          }

          res.status(200).json(result);
      } catch (error: any) {
          console.error('[UNIFIED LOGIN ERROR]', error);
          if (error.message === 'Invalid credentials') {
              res.status(401).json({ error: error.message });
          } else {
              res.status(500).json({ error: 'Internal Server Error', details: error.message });
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
        path: '/auth/refresh', // Changed from '/api/auth/refresh'
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
      res.clearCookie('refreshToken', { path: '/auth/refresh' });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
       res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
