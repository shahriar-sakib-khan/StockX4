import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const createToken = (payload: { userId: string, role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};
