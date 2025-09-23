import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Load from '@/models/Load';
import mongoose from 'mongoose';

// GET /api/loads/[loadId] - Get a specific load by ID
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

    const load = await Load.findById(loadId)
      .populate('shipperId', 'firstName lastName companyName email phone')
      .populate('carrierId', 'firstName lastName companyName email phone mcNumber');

    if (!load) {
      return NextResponse.json({ success: false, message: 'Load not found' }, { status: 404 });
    }

    // Check authorization based on user role
    if (user.role === 'shipper') {
      // Shippers can only view their own loads
      if (load.shipperId._id.toString() !== user._id.toString()) {
        return NextResponse.json({ success: false, message: 'Unauthorized to view this load' }, { status: 403 });
      }
    } else if (user.role === 'carrier') {
      // Carriers can view loads they're assigned to or available loads
      if (load.carrierId && load.carrierId._id.toString() !== user._id.toString() && load.status !== 'posted') {
        return NextResponse.json({ success: false, message: 'Unauthorized to view this load' }, { status: 403 });
      }
    } else if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, load });

  } catch (error: unknown) {
    console.error('Error fetching load:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/loads/[loadId] - Update load status (for carriers)
export async function PUT(request: NextRequest, { params }: { params: { loadId: string } }) {
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

    const body = await request.json();
    const { status } = body;

  // Validate status (carrier cannot directly mark final delivered, only delivered_pending first)
  const validStatuses = ['assigned', 'in_transit', 'delivered_pending', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      }, { status: 400 });
    }

    const load = await Load.findById(loadId);

    if (!load) {
      return NextResponse.json({ success: false, message: 'Load not found' }, { status: 404 });
    }

    // Role-based status transition rules
    if (user.role === 'carrier') {
      if (!load.carrierId || load.carrierId.toString() !== user._id.toString()) {
        return NextResponse.json({ success: false, message: 'Only the assigned carrier can update load status' }, { status: 403 });
      }
      // Carrier cannot set final delivered directly
      if (status === 'delivered') {
        return NextResponse.json({ success: false, message: 'Carrier cannot finalize delivery (requires shipper approval)' }, { status: 403 });
      }
      // When carrier marks as delivered, we set delivered_pending instead
      if (status === 'delivered_pending') {
        if (load.status !== 'in_transit') {
          return NextResponse.json({ success: false, message: 'Load must be in transit before marking delivered' }, { status: 400 });
        }
      }
    } else if (user.role === 'shipper') {
      // Shipper can cancel posted/assigned/in_transit/delivered_pending (not after final delivered)
      if (status === 'cancelled') {
        if (load.shipperId.toString() !== user._id.toString()) {
          return NextResponse.json({ success: false, message: 'Cannot cancel a load you do not own' }, { status: 403 });
        }
      } else if (status === 'delivered') {
        // Shipper can approve delivered_pending -> delivered
        if (load.status !== 'delivered_pending') {
          return NextResponse.json({ success: false, message: 'Load must be awaiting delivery approval' }, { status: 400 });
        }
      } else if (status === 'in_transit') {
        // Shipper rejecting delivered_pending moves it back
        if (load.status !== 'delivered_pending') {
          return NextResponse.json({ success: false, message: 'Can only revert a pending delivery back to in transit' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ success: false, message: 'Shippers can only approve or reject delivery or cancel the load' }, { status: 403 });
      }
    } else if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Update status and timestamp
    load.status = status;
    
    if (status === 'in_transit' && !load.pickedUpAt) {
      load.pickedUpAt = new Date();
    } else if (status === 'delivered' && !load.deliveredAt) {
      load.deliveredAt = new Date();
    }

    await load.save();

    return NextResponse.json({ 
      success: true, 
      message: `Load status updated to ${status}`,
      load 
    });

  } catch (error: unknown) {
    console.error('Error updating load status:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}