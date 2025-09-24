import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import User from '@/models/User';

// GET /api/admin/users - list users with filters
// Query params: role, q (search email/name), page, limit, isActive
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await authenticateUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const q = searchParams.get('q');
    const isActive = searchParams.get('isActive');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;
    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - create a user (including admin if explicitly role provided)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await authenticateUser(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email, password, role, firstName, lastName, company, phone,
      truckNumber, truckType, truckCapacity, cdlNumber, dotNumber, mcNumber, isActive = true
    } = body;

    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (!['admin', 'shipper', 'carrier', 'driver'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 409 });
    }

    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName,
      company,
      phone,
      truckNumber,
      truckType,
      truckCapacity,
      cdlNumber,
      dotNumber,
      mcNumber,
      isActive
    });

    return NextResponse.json({ success: true, message: 'User created', user: { ...user.toObject(), password: undefined } }, { status: 201 });
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
