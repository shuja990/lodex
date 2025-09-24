import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();
    const admin = await authenticateUser(request);
    if (!admin || admin.role !== 'admin') return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

    const { userId } = params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return NextResponse.json({ success: false, message: 'Invalid user id' }, { status: 400 });
    const user = await User.findById(userId).select('-password');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user });
  } catch (e) {
    console.error('Admin get user error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();
    const admin = await authenticateUser(request);
    if (!admin || admin.role !== 'admin') return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    const { userId } = params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return NextResponse.json({ success: false, message: 'Invalid user id' }, { status: 400 });
    const body = await request.json();
    const allowed = ['firstName','lastName','company','phone','role','isActive','truckNumber','truckType','truckCapacity','cdlNumber','dotNumber','mcNumber'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    if (body.password) update['password'] = body.password; // will trigger pre-save hash
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    if (user._id.toString() === admin._id.toString() && update['isActive'] === false) {
      return NextResponse.json({ success: false, message: 'You cannot deactivate yourself.' }, { status: 400 });
    }
    Object.assign(user, update);
    await user.save();
    const sanitized = user.toObject();
    delete sanitized.password;
    return NextResponse.json({ success: true, message: 'User updated', user: sanitized });
  } catch (e) {
    console.error('Admin update user error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();
    const admin = await authenticateUser(request);
    if (!admin || admin.role !== 'admin') return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    const { userId } = params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return NextResponse.json({ success: false, message: 'Invalid user id' }, { status: 400 });
    if (userId === admin._id.toString()) return NextResponse.json({ success: false, message: 'Cannot delete yourself' }, { status: 400 });
    const result = await User.findByIdAndDelete(userId);
    if (!result) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (e) {
    console.error('Admin delete user error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
