import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { LoginRequest, AuthResponse } from '@/types/auth';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    const body: LoginRequest = await request.json();
    
    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required' 
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Account is deactivated. Please contact support.' 
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Validate password
    const isValidPassword = await user.comparePassword(body.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id?.toString(),
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
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
      token,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      } as AuthResponse,
      { status: 500 }
    );
  }
}