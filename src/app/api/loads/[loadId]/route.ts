import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Load from '@/models/Load';
import mongoose from 'mongoose';
import { z } from 'zod';

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
  const { status } = body as { status?: string };

  // Validate status (carrier cannot directly mark final delivered, only delivered_pending first)
  const validStatuses = ['assigned', 'in_transit', 'delivered_pending', 'delivered', 'cancelled'];
  if (status !== undefined && !validStatuses.includes(status)) {
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
    if (user.role === 'carrier' || user.role === 'driver') {
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
      // Allow shipper to edit load details if not assigned
      if (!load.carrierId && body.origin) {
        // Validate payload via zod
        const loadSchema = z.object({
          origin: z.object({ address: z.string(), city: z.string(), state: z.string(), zipCode: z.string(), coordinates: z.object({ latitude: z.number(), longitude: z.number() }) }),
          destination: z.object({ address: z.string(), city: z.string(), state: z.string(), zipCode: z.string(), coordinates: z.object({ latitude: z.number(), longitude: z.number() }) }),
          loadType: z.string(),
          equipmentType: z.string(),
          details: z.object({ weight: z.number(), length: z.number().optional(), width: z.number().optional(), height: z.number().optional(), pieces: z.number().optional(), description: z.string(), specialInstructions: z.string().optional(), hazmat: z.boolean().optional(), temperatureControlled: z.boolean().optional(), temperatureRange: z.object({ min: z.number().optional(), max: z.number().optional() }).optional() }),
          pickupDate: z.string(),
          deliveryDate: z.string(),
          pickupTime: z.string().optional(),
          deliveryTime: z.string().optional(),
          rate: z.number(),
          contactInfo: z.object({ pickup: z.object({ name: z.string(), phone: z.string(), email: z.string().optional() }), delivery: z.object({ name: z.string(), phone: z.string(), email: z.string().optional() }) }),
          referenceNumber: z.string().optional()
        });
        const parsed = loadSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json({ success: false, message: parsed.error.message }, { status: 400 });
        }
        const data = parsed.data;
        // apply updates
        load.origin = data.origin;
        load.destination = data.destination;
        load.loadType = data.loadType;
        load.equipmentType = data.equipmentType;
        load.details = data.details;
        load.pickupDate = new Date(data.pickupDate);
        load.deliveryDate = new Date(data.deliveryDate);
        load.pickupTime = data.pickupTime;
        load.deliveryTime = data.deliveryTime;
        load.rate = data.rate;
        load.referenceNumber = data.referenceNumber;
  load.contactInfo = data.contactInfo;
        await load.save();
        return NextResponse.json({ success: true, message: 'Load updated successfully', load });
      }
      // Shipper status transitions and cancel/deliver logic
      if (status === 'cancelled') {
        if (load.shipperId.toString() !== user._id.toString()) {
          return NextResponse.json({ success: false, message: 'Cannot cancel a load you do not own' }, { status: 403 });
        }
      } else if (status === 'delivered') {
        if (load.status !== 'delivered_pending') {
          return NextResponse.json({ success: false, message: 'Load must be awaiting delivery approval' }, { status: 400 });
        }
      } else if (status === 'in_transit') {
        if (load.status !== 'delivered_pending') {
          return NextResponse.json({ success: false, message: 'Can only revert a pending delivery back to in transit' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ success: false, message: 'Shippers can only edit details or manage delivery/cancel', }, { status: 403 });
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