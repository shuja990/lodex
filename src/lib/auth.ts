import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { IUserDocument } from '@/models/User';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function authenticateUser(request: NextRequest): Promise<IUserDocument | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
