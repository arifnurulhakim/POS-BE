import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // *Type assertion* supaya TypeScript gak error
    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};