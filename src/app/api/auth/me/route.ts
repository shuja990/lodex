import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { AuthResponse } from '@/types/auth';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authorization token required' 
        } as AuthResponse,
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired token' 
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        } as AuthResponse,
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Account is deactivated' 
        } as AuthResponse,
        { status: 401 }
      );
    }

    const response: AuthResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      user: {
        _id: user._id?.toString() || '',
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        truckNumber: user.truckNumber,
        truckType: user.truckType,
        truckCapacity: user.truckCapacity,
        cdlNumber: user.cdlNumber,
        dotNumber: user.dotNumber,
        mcNumber: user.mcNumber,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    console.error('Profile error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      } as AuthResponse,
      { status: 500 }
    );
  }
}