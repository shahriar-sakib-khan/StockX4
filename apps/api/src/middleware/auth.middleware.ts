import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) throw new Error('FATAL: JWT_SECRET environment variable is required');
const JWT_SECRET: string = _jwtSecret;

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    name: string;
    storeId?: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; name: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
