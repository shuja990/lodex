import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Load from '@/models/Load';
import Offer, { serializeOffer } from '@/models/Offer';
import mongoose from 'mongoose';

// POST /api/loads/[loadId]/offers - Carrier makes an offer on a load
export async function POST(request: NextRequest, { params }: { params: { loadId: string } }) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'carrier') {
      return NextResponse.json({ success: false, message: 'Only carriers can make offers' }, { status: 403 });
    }

    const { loadId } = params;
    if (!mongoose.Types.ObjectId.isValid(loadId)) {
      return NextResponse.json({ success: false, message: 'Invalid Load ID' }, { status: 400 });
    }

    const body = await request.json();
    const { amount, message } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, message: 'A valid offer amount is required' }, { status: 400 });
    }

    const load = await Load.findById(loadId);

    if (!load) {
      return NextResponse.json({ success: false, message: 'Load not found' }, { status: 404 });
    }

    if (load.status !== 'posted') {
      return NextResponse.json({ success: false, message: 'This load is no longer available for offers' }, { status: 400 });
    }

    if (load.shipperId.toString() === user._id.toString()) {
      return NextResponse.json({ success: false, message: 'You cannot make an offer on your own load' }, { status: 400 });
    }

    // Check if an offer already exists from this carrier for this load
  const existingOffer = await Offer.findOne({ loadId, carrierId: user._id });
    if (existingOffer) {
      // Optionally, allow updating the offer
      existingOffer.amount = amount;
      existingOffer.message = message || existingOffer.message;
      existingOffer.status = 'pending'; // Reset status if it was rejected before
  await existingOffer.save();
  return NextResponse.json({ success: true, message: 'Offer updated successfully', offer: serializeOffer(existingOffer) }, { status: 200 });
    }

    const offerDoc = await Offer.create({
      loadId,
      carrierId: user._id,
      amount,
      message,
    });
    return NextResponse.json({ success: true, message: 'Offer submitted successfully', offer: serializeOffer(offerDoc) }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'MongoServerError' && (error as { code: number }).code === 11000) {
        return NextResponse.json({ success: false, message: 'You have already placed an offer on this load.' }, { status: 409 });
    }
    console.error('Offer creation error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/loads/[loadId]/offers - Shipper views offers on their load
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

    const load = await Load.findById(loadId);

    if (!load) {
      return NextResponse.json({ success: false, message: 'Load not found' }, { status: 404 });
    }

    // Only the shipper who owns the load can view offers
    if (load.shipperId.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'You are not authorized to view offers for this load' }, { status: 403 });
    }

    const offers = await Offer.find({ loadId })
      .populate('carrierId', 'company companyName firstName lastName email phone mcNumber')
      .sort({ createdAt: -1 })
      .lean();

    const serialized = offers.map(o => serializeOffer(o));
    return NextResponse.json({ success: true, offers: serialized });

  } catch (error: unknown) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
