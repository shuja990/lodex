import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Load from '@/models/Load';
import mongoose from 'mongoose';

// DELETE /api/admin/loads/[loadId] - admin deletes a load
export async function DELETE(request: NextRequest, { params }: { params: { loadId: string } }) {
  try {
    await connectToDatabase();
    const admin = await authenticateUser(request);
    if (!admin || admin.role !== 'admin') return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    const { loadId } = params;
    if (!mongoose.Types.ObjectId.isValid(loadId)) return NextResponse.json({ success: false, message: 'Invalid load id' }, { status: 400 });
    const result = await Load.findByIdAndDelete(loadId);
    if (!result) return NextResponse.json({ success: false, message: 'Load not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Load deleted' });
  } catch (e) {
    console.error('Admin delete load error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
