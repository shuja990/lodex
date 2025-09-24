import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Load from '@/models/Load';
import ChatMessage from '@/models/ChatMessage';
import mongoose from 'mongoose';

// GET /api/loads/[loadId]/chat?since=<ISO>
export async function GET(request: NextRequest, { params }: { params: { loadId: string } }) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { loadId } = params;
    if (!mongoose.Types.ObjectId.isValid(loadId)) {
      return NextResponse.json({ success: false, message: 'Invalid Load ID' }, { status: 400 });
    }

    const load = await Load.findById(loadId).select('shipperId carrierId status');
    if (!load) {
      return NextResponse.json({ success: false, message: 'Load not found' }, { status: 404 });
    }

    const isParticipant = [load.shipperId?.toString(), load.carrierId?.toString()].includes(user._id.toString()) || user.role === 'admin';
    if (!isParticipant) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
  const query: { loadId: string; createdAt?: { $gt: Date } } = { loadId };
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        query.createdAt = { $gt: sinceDate };
      }
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 }).lean();

    const serialized = messages.map(m => ({
      _id: m._id.toString(),
      loadId: m.loadId.toString(),
      senderId: m.senderId.toString(),
      message: m.message,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString()
    }));

    return NextResponse.json({ success: true, messages: serialized, since: since || null });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/loads/[loadId]/chat
export async function POST(request: NextRequest, { params }: { params: { loadId: string } }) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { loadId } = params;
    if (!mongoose.Types.ObjectId.isValid(loadId)) {
      return NextResponse.json({ success: false, message: 'Invalid Load ID' }, { status: 400 });
    }

    const load = await Load.findById(loadId).select('shipperId carrierId status');
    if (!load) {
      return NextResponse.json({ success: false, message: 'Load not found' }, { status: 404 });
    }

    // Chat allowed only when carrier assigned and before final delivered
    if (!load.carrierId) {
      return NextResponse.json({ success: false, message: 'Chat not available until an offer is accepted' }, { status: 400 });
    }
    if (load.status === 'delivered') {
      return NextResponse.json({ success: false, message: 'Chat closed for delivered load' }, { status: 400 });
    }

    const isParticipant = [load.shipperId?.toString(), load.carrierId?.toString()].includes(user._id.toString()) || user.role === 'admin';
    if (!isParticipant) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { message } = body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    const doc = await ChatMessage.create({ loadId, senderId: user._id, message: message.trim() });
    const serialized = {
      _id: doc._id.toString(),
      loadId: doc.loadId.toString(),
      senderId: doc.senderId.toString(),
      message: doc.message,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };

    return NextResponse.json({ success: true, message: 'Message sent', messages: [serialized] }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
