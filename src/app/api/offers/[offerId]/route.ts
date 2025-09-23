import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Offer from '@/models/Offer';
import Load from '@/models/Load';
import mongoose from 'mongoose';

// PUT /api/offers/[offerId] - Shipper accepts or rejects an offer
export async function PUT(request: NextRequest, { params }: { params: { offerId: string } }) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'shipper') {
      return NextResponse.json({ success: false, message: 'Only shippers can manage offers' }, { status: 403 });
    }

    const { offerId } = params;
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return NextResponse.json({ success: false, message: 'Invalid Offer ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status provided. Must be "accepted" or "rejected".' }, { status: 400 });
    }

    const offer = await Offer.findById(offerId).populate('loadId');

    if (!offer) {
      return NextResponse.json({ success: false, message: 'Offer not found' }, { status: 404 });
    }

    const load = offer.loadId as any;

    if (!load) {
        return NextResponse.json({ success: false, message: 'Associated load not found for this offer.' }, { status: 404 });
    }

    if (load.shipperId.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'You are not authorized to manage this offer' }, { status: 403 });
    }

    if (load.status !== 'posted') {
      return NextResponse.json({ success: false, message: `This load is already ${load.status} and cannot be assigned.` }, { status: 400 });
    }

    // Update the offer status
    offer.status = status;
    await offer.save();

    if (status === 'accepted') {
      // Update the load status and assign the carrier using updateOne to avoid validation issues
      await Load.updateOne(
        { _id: load._id },
        { 
          $set: { 
            status: 'assigned',
            carrierId: offer.carrierId,
            assignedAt: new Date(),
            rate: offer.amount
          }
        }
      );

      // Reject all other pending offers for this load
      await Offer.updateMany(
        { loadId: load._id, status: 'pending', _id: { $ne: offer._id } },
        { $set: { status: 'rejected' } }
      );
    }

    return NextResponse.json({ success: true, message: `Offer ${status} successfully.`, offer });

  } catch (error: unknown) {
    console.error('Offer update error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
