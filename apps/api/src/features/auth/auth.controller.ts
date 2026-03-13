import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { logger } from '../../config/logger';

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
      try {
          const { identifier, password } = req.body;
          const result = await AuthService.login(identifier, password) as any;

          if (result.refreshToken) {
              res.cookie('refreshToken', result.refreshToken, {
                  httpOnly: true,
                  path: '/auth/refresh',
                  maxAge: 7 * 24 * 60 * 60 * 1000,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
              });
          }

          res.status(200).json(result);
      } catch (error: any) {
          logger.error('[LOGIN ERROR] ' + error.message);
          if (error.message === 'Invalid credentials') {
              res.status(401).json({ error: 'Invalid credentials' });
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
        path: '/auth/refresh', // Changed from '/api/auth/refresh'
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

  static async googleLogin(req: Request, res: Response) {
      try {
          const { credential } = req.body;
          const result = await AuthService.googleLogin(credential) as any;

          if (result.refreshToken) {
              res.cookie('refreshToken', result.refreshToken, {
                  httpOnly: true,
                  path: '/auth/refresh',
                  maxAge: 7 * 24 * 60 * 60 * 1000,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
              });
          }

          res.status(200).json(result);
      } catch (error: any) {
          logger.error('[GOOGLE LOGIN ERROR] ' + error.message);
          res.status(401).json({ error: 'Google authentication failed' });
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
