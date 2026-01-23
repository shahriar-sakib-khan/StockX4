/**
 * TEST SCENARIOS (Manifest)
 * ---------------------------------------------------
 * 1. [Happy Path] Login sets refreshToken cookie & returns accessToken (200)
 * 2. [Happy Path] Refresh token rotates and returns new access/refresh tokens (200)
 * 3. [Validation] Refresh with missing cookie returns 401
 * 4. [Happy Path] Logout clears refresh cookie (200)
 * ---------------------------------------------------
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AuthController } from './auth.controller';

// Mock AuthService
vi.mock('./auth.service', () => ({
  AuthService: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  },
}));

import { AuthService } from './auth.service';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/auth/register', AuthController.register);
app.post('/auth/login', AuthController.login);
app.post('/auth/refresh', AuthController.refresh);
app.post('/auth/logout', AuthController.logout);

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should set refreshToken cookie and return accessToken', async () => {
      const mockResult = {
          accessToken: 'access_123',
          refreshToken: 'refresh_123',
          user: { id: '1', email: 'test@test.com' }
      };
      (AuthService.login as any).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'pass' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ accessToken: 'access_123', user: mockResult.user });
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken=refresh_123');
      expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new accessToken and set new cookie', async () => {
       (AuthService.refresh as any).mockResolvedValue({ accessToken: 'new_access', refreshToken: 'new_refresh' });

       const response = await request(app)
         .post('/auth/refresh')
         .set('Cookie', ['refreshToken=old_refresh']);

       expect(response.status).toBe(200);
       expect(response.body).toEqual({ accessToken: 'new_access' });
       expect(response.headers['set-cookie'][0]).toContain('refreshToken=new_refresh');
    });

    it('should return 401 if cookie missing', async () => {
        const response = await request(app).post('/auth/refresh');
        expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
      it('should clear cookie and status 200', async () => {
          const response = await request(app)
            .post('/auth/logout')
            .set('Cookie', ['refreshToken=token']);

          expect(response.status).toBe(200);
          expect(response.headers['set-cookie'][0]).toContain('refreshToken=;'); // cleared
      });
  });
});
