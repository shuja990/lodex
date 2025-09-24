import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/admin/seed  (one-time) - Protected by header x-seed-token matching ENV ADMIN_SEED_TOKEN
// Body optional: { email, password, firstName, lastName }
export async function POST(request: NextRequest) {
  try {
    if (!process.env.ADMIN_SEED_TOKEN) {
      return NextResponse.json({ success: false, message: 'ADMIN_SEED_TOKEN not configured' }, { status: 500 });
    }
    const token = request.headers.get('x-seed-token');
    if (token !== process.env.ADMIN_SEED_TOKEN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Admin already exists', admin: { email: existing.email } });
    }

  let body: unknown = {};
  try { body = await request.json(); } catch {/* empty body ok */}
  const b = (typeof body === 'object' && body !== null) ? body as Record<string, unknown> : {};
  const email = typeof b.email === 'string' ? b.email : 'admin@lodex.com';
  const password = typeof b.password === 'string' ? b.password : 'admin123';
  const firstName = typeof b.firstName === 'string' ? b.firstName : 'System';
  const lastName = typeof b.lastName === 'string' ? b.lastName : 'Administrator';

    const admin = await User.create({
      email,
      password,
      role: 'admin',
      firstName,
      lastName,
      isActive: true
    });

    return NextResponse.json({ success: true, message: 'Admin created', admin: { email: admin.email } });
  } catch (e) {
    console.error('Admin seed error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
