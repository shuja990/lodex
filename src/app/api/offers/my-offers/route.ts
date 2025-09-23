import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Offer, { serializeOffer } from '@/models/Offer';
import Load from '@/models/Load'; // eslint-disable-line @typescript-eslint/no-unused-vars -- Import Load model to register the schema
import User from '@/models/User';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Helper function to authenticate and get user
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

// GET /api/offers/my-offers - Get carrier's offers
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Only carriers can view their offers
    if (user.role !== 'carrier' && user.role !== 'driver') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only carriers can view offers' 
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Get offers with load details
    const [offers, total] = await Promise.all([
      Offer.find({ carrierId: user._id })
        .populate({
          path: 'loadId',
          select: 'loadNumber origin destination equipmentType distance rate pickupDate status'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Offer.countDocuments({ carrierId: user._id })
    ]);

    const serializedOffers = offers.map(o => serializeOffer(o));

    return NextResponse.json({
      success: true,
      message: 'Offers retrieved successfully',
      offers: serializedOffers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Get carrier offers error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}