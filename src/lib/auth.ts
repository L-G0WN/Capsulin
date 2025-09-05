import 'dotenv/config';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET;

export const hashed = async (value: string, saltRounds: number = 10): Promise<string> => {
  return await bcrypt.hash(value, saltRounds);
};

export const verifyHash = async (value: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(value, hash);
};

export const generateToken = (
  payload: Record<string, any>,
  expiresIn: string | number = '2h'
): string => {
  return jwt.sign(payload, SECRET_KEY!, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, SECRET_KEY!);
  } catch (err) {
    return null;
  }
};