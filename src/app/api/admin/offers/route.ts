import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Offer, { serializeOffer } from '@/models/Offer';
import '@/models/Load'; // register schema only

// GET /api/admin/offers - list offers with filters
// Query: status, carrier, shipper, page, limit
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await authenticateUser(request);
    if (!admin || admin.role !== 'admin') return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const carrier = searchParams.get('carrier');
    const shipper = searchParams.get('shipper');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (carrier) filter.carrierId = carrier;
    if (shipper) filter.shipperId = shipper; // this field might not exist directly; offers reference load. We'll handle by populate filter below if needed.

    const query = Offer.find(filter)
      .populate({ 
        path: 'loadId', 
        select: 'origin destination rate status shipperId weight description details equipmentType',
        populate: { 
          path: 'shipperId', 
          select: 'firstName lastName company email' 
        } 
      })
      .populate('carrierId', 'firstName lastName company email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [offers, total] = await Promise.all([
      query,
      Offer.countDocuments(filter)
    ]);

    // Filter by shipper if requested and not directly on offer
    let filtered = offers;
    if (shipper) {
      filtered = filtered.filter((o: unknown) => {
        const off = o as { loadId?: { shipperId?: { _id: { toString(): string } } } };
        return off.loadId?.shipperId?._id.toString() === shipper;
      });
    }

    return NextResponse.json({
      success: true,
  offers: filtered.map(o => serializeOffer(o as unknown as never)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (e) {
    console.error('Admin list offers error:', e);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
