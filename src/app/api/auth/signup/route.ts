import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { CreateUserRequest, AuthResponse } from '@/types/auth';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    const body: CreateUserRequest = await request.json();
    
    // Basic validation
    if (!body.email || !body.password || !body.role || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email, password, role, first name, and last name are required' 
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Role-specific validation
    if (body.role === 'shipper') {
      if (!body.company) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Company name is required for shippers' 
          } as AuthResponse,
          { status: 400 }
        );
      }
    }

    if (body.role === 'carrier') {
      if (!body.company) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Company name is required for carriers (fleet owners)' 
          } as AuthResponse,
          { status: 400 }
        );
      }
      if (!body.mcNumber) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'MC Number is required for carriers (fleet owners)' 
          } as AuthResponse,
          { status: 400 }
        );
      }
      if (!body.dotNumber) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'DOT Number is required for carriers' 
          } as AuthResponse,
          { status: 400 }
        );
      }
    }

    if (body.role === 'driver') {
      if (!body.truckNumber || !body.truckType || !body.cdlNumber) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Truck number, truck type, and CDL number are required for drivers' 
          } as AuthResponse,
          { status: 400 }
        );
      }
      if (!body.dotNumber) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'DOT Number is required for drivers' 
          } as AuthResponse,
          { status: 400 }
        );
      }
    }

    if (!body.phone && (body.role === 'carrier' || body.role === 'driver')) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Phone number is required for ${body.role}s` 
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format' 
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Validate role (admin cannot signup)
    if (body.role === 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Admin accounts cannot be created through signup' 
        } as AuthResponse,
        { status: 403 }
      );
    }

    if (!['shipper', 'carrier', 'driver'].includes(body.role)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid role. Must be shipper, carrier, or driver' 
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create(body);

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
      message: 'User created successfully',
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

    return NextResponse.json(response, { status: 201 });

  } catch (error: unknown) {
    console.error('Signup error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('duplicate key error') || errorMessage.includes('E11000')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User with this email already exists' 
        } as AuthResponse,
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      } as AuthResponse,
      { status: 500 }
    );
  }
}