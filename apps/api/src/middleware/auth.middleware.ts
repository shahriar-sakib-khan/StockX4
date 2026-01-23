import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('Auth Middleware: Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth Middleware: No bearer token');
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    console.log('Auth Middleware: Decoded:', decoded);
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    console.log('Auth Middleware: Invalid token', error);
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
