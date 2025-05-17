import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const productMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log(token);
    console.log(decoded);
    // ✅ Casting req ke any hanya saat assign req.user
    (req as any).user = { id: decoded.userId };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

