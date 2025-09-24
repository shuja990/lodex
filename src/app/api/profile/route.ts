import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import User from '@/models/User';

// GET /api/profile - get current user profile
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    // Get fresh user data without password
    const profile = await User.findById(user._id).select('-password');
    
    return NextResponse.json({
      success: true,
      user: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile - update current user profile
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      company,
      phone,
      // Carrier/Driver specific fields
      truckNumber,
      truckType,
      truckCapacity,
      cdlNumber,
      dotNumber,
      mcNumber,
      // Optional password change
      currentPassword,
      newPassword
    } = body;

    const updateData: Record<string, unknown> = {};
    
    // Basic fields that all users can update
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    
    // Carrier/Driver specific fields
    if (user.role === 'carrier' || user.role === 'driver') {
      if (truckNumber !== undefined) updateData.truckNumber = truckNumber;
      if (truckType !== undefined) updateData.truckType = truckType;
      if (truckCapacity !== undefined) updateData.truckCapacity = truckCapacity;
      if (cdlNumber !== undefined) updateData.cdlNumber = cdlNumber;
      if (dotNumber !== undefined) updateData.dotNumber = dotNumber;
      if (mcNumber !== undefined) updateData.mcNumber = mcNumber;
    }

    // Handle password change if requested
    if (newPassword && currentPassword) {
      const currentUser = await User.findById(user._id);
      if (!currentUser) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      const isValidPassword = await currentUser.comparePassword(currentPassword);
      if (!isValidPassword) {
        return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 });
      }

      updateData.password = newPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}