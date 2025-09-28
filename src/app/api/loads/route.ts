import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Load from '@/models/Load';
import User from '@/models/User';
import { CreateLoadRequest, LoadResponse, LoadSearchFilters, EquipmentType, LoadType } from '@/types/load';
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

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// GET /api/loads - List loads with filters
export async function GET(request: NextRequest) {
  // Get searchParams from request
  const searchParams = request.nextUrl.searchParams;
  // Do not set userLat/userLng by default; only use them if present for filtering below
  try {
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required' 
        } as LoadResponse,
        { status: 401 }
      );
    }

  // (Removed duplicate destructure; use searchParams from request.nextUrl only)
    
    // Build query based on user role
    const baseQuery: Record<string, unknown> = {};
    
    if (user.role === 'shipper') {
      // Shippers see only their own loads
      baseQuery.shipperId = user._id;
    } else if (user.role === 'carrier' || user.role === 'driver') {
      // Carriers see available loads or their assigned loads
      const assigned = searchParams.get('assigned');
      if (assigned === 'true') {
        baseQuery.carrierId = user._id;
      } else {
        baseQuery.status = 'posted';
        // Include loads from start of today, not just future times
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        baseQuery.pickupDate = { $gte: today };
      }
    } else if (user.role === 'admin') {
      // Admin sees all loads
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized' 
        } as LoadResponse,
        { status: 403 }
      );
    }

    // Apply filters
    const filters: LoadSearchFilters = {
      equipmentType: searchParams.get('equipmentType') as LoadSearchFilters['equipmentType'],
      loadType: searchParams.get('loadType') as LoadSearchFilters['loadType'],
      pickupDateFrom: searchParams.get('pickupDateFrom') || undefined,
      pickupDateTo: searchParams.get('pickupDateTo') || undefined,
      deliveryDateFrom: searchParams.get('deliveryDateFrom') || undefined,
      deliveryDateTo: searchParams.get('deliveryDateTo') || undefined,
      minRate: searchParams.get('minRate') ? parseFloat(searchParams.get('minRate')!) : undefined,
      maxRate: searchParams.get('maxRate') ? parseFloat(searchParams.get('maxRate')!) : undefined,
      maxDistance: searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : undefined,
      hazmat: searchParams.get('hazmat') === 'true' ? true : undefined,
      temperatureControlled: searchParams.get('temperatureControlled') === 'true' ? true : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: (searchParams.get('sortBy') as LoadSearchFilters['sortBy']) || 'postedAt',
      sortOrder: (searchParams.get('sortOrder') as LoadSearchFilters['sortOrder']) || 'desc'
    };

    // Apply equipment type filter
    if (filters.equipmentType) {
      baseQuery.equipmentType = filters.equipmentType;
    }

    // Apply load type filter
    if (filters.loadType) {
      baseQuery.loadType = filters.loadType;
    }

    // Apply date filters
    if (filters.pickupDateFrom || filters.pickupDateTo) {
      baseQuery.pickupDate = {};
      if (filters.pickupDateFrom) {
        baseQuery.pickupDate.$gte = new Date(filters.pickupDateFrom);
      }
      if (filters.pickupDateTo) {
        baseQuery.pickupDate.$lte = new Date(filters.pickupDateTo);
      }
    }

    if (filters.deliveryDateFrom || filters.deliveryDateTo) {
      baseQuery.deliveryDate = {};
      if (filters.deliveryDateFrom) {
        baseQuery.deliveryDate.$gte = new Date(filters.deliveryDateFrom);
      }
      if (filters.deliveryDateTo) {
        baseQuery.deliveryDate.$lte = new Date(filters.deliveryDateTo);
      }
    }

    // Apply rate filters
    if (filters.minRate || filters.maxRate) {
      baseQuery.rate = {};
      if (filters.minRate) {
        baseQuery.rate.$gte = filters.minRate;
      }
      if (filters.maxRate) {
        baseQuery.rate.$lte = filters.maxRate;
      }
    }

    // Apply distance filter
    if (filters.maxDistance) {
      baseQuery.distance = { $lte: filters.maxDistance };
    }

    // Apply hazmat filter
    if (filters.hazmat !== undefined) {
      baseQuery['details.hazmat'] = filters.hazmat;
    }

    // Apply temperature controlled filter
    if (filters.temperatureControlled !== undefined) {
      baseQuery['details.temperatureControlled'] = filters.temperatureControlled;
    }

    // Apply location-based filtering for carriers only if radius is specified
    if ((user.role === 'carrier' || user.role === 'driver') && 
        (searchParams.get('userLat') && searchParams.get('userLng') && searchParams.get('radius'))) {
      const userLat = parseFloat(searchParams.get('userLat')!);
      const userLng = parseFloat(searchParams.get('userLng')!);
      const radius = parseFloat(searchParams.get('radius')!);

      // Find loads within radius of user's location
      const radiusInMeters = radius * 1609.34;
      baseQuery['$or'] = [
        {
          'origin.coordinates': {
            $geoWithin: {
              $centerSphere: [[userLng, userLat], radiusInMeters / 6378100]
            }
          }
        },
        {
          'destination.coordinates': {
            $geoWithin: {
              $centerSphere: [[userLng, userLat], radiusInMeters / 6378100]
            }
          }
        }
      ];
    }

    // Carrier route filter: show loads near the route line (JS-side filtering for compatibility)
    let routeFilter = null;
    if ((user.role === 'carrier' || user.role === 'driver') &&
        searchParams.get('routeStartLat') && searchParams.get('routeStartLng') &&
        searchParams.get('routeEndLat') && searchParams.get('routeEndLng')) {
      const startLat = parseFloat(searchParams.get('routeStartLat')!);
      const startLng = parseFloat(searchParams.get('routeStartLng')!);
      const endLat = parseFloat(searchParams.get('routeEndLat')!);
      const endLng = parseFloat(searchParams.get('routeEndLng')!);
      routeFilter = { startLat, startLng, endLat, endLng };
    }

    // Pagination
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    // Sorting
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[filters.sortBy || 'postedAt'] = filters.sortOrder === 'asc' ? 1 : -1;


    // Execute query (fetch all, filter by route in JS if needed)
    let allLoads = await Load.find(baseQuery)
      .populate('shipperId', 'firstName lastName company email phone')
      .populate('carrierId', 'firstName lastName company email phone')
      .sort(sortOptions);

    // Haversine helper
    function haversine(lat1, lng1, lat2, lng2) {
      const toRad = (deg) => deg * Math.PI / 180;
      const R = 3959; // miles
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // If route filter is set, filter loads in JS
    if (routeFilter) {
      allLoads = allLoads.filter(load => {
        const o = load.origin?.coordinates;
        const d = load.destination?.coordinates;
        if (!o || !d) return false;
        const distOriginToStart = haversine(o.latitude, o.longitude, routeFilter.startLat, routeFilter.startLng);
        const distDestToEnd = haversine(d.latitude, d.longitude, routeFilter.endLat, routeFilter.endLng);
        // Only show if origin is near route start OR destination is near route end (within 100 miles)
        return distOriginToStart <= 100 || distDestToEnd <= 100;
      });
    }

    // Only filter by distance if radius parameter is explicitly provided (not just userLat/userLng for sorting)
    if (searchParams.get('userLat') && searchParams.get('userLng') && searchParams.get('radius')) {
      const userLat = parseFloat(searchParams.get('userLat'));
      const userLng = parseFloat(searchParams.get('userLng'));
      const radius = parseFloat(searchParams.get('radius'));
      allLoads = allLoads.filter(load => {
        const o = load.origin?.coordinates;
        if (!o) return false;
        const dist = haversine(userLat, userLng, o.latitude, o.longitude);
        return dist <= radius;
      });
    }

    // Pagination after filtering
    const total = allLoads.length;
    const pagedLoads = allLoads.slice(skip, skip + limit);

    const response: LoadResponse = {
      success: true,
      message: 'Loads retrieved successfully',
      loads: pagedLoads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Loads listing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      } as LoadResponse,
      { status: 500 }
    );
  }
}

// POST /api/loads - Create a new load
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required' 
        } as LoadResponse,
        { status: 401 }
      );
    }

    // Only shippers can create loads
    if (user.role !== 'shipper') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only shippers can create loads' 
        } as LoadResponse,
        { status: 403 }
      );
    }

    const body: CreateLoadRequest = await request.json();

    // Validation
    if (!body.origin || !body.destination || !body.loadType || !body.equipmentType || 
        !body.details || !body.pickupDate || !body.deliveryDate || !body.rate || 
        !body.contactInfo) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields' 
        } as LoadResponse,
        { status: 400 }
      );
    }

    // Validate dates (allow same-day pickup vs now; allow same-day delivery)
    const pickupDate = new Date(body.pickupDate);
    const deliveryDate = new Date(body.deliveryDate);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (pickupDate < todayStart) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Pickup date cannot be in the past' 
        } as LoadResponse,
        { status: 400 }
      );
    }

    if (deliveryDate < pickupDate) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Delivery date must be on or after pickup date' 
        } as LoadResponse,
        { status: 400 }
      );
    }

    // Calculate distance between origin and destination
    const distance = calculateDistance(
      body.origin.coordinates.latitude,
      body.origin.coordinates.longitude,
      body.destination.coordinates.latitude,
      body.destination.coordinates.longitude
    );

    // Create load
    const load = await Load.create({
      shipperId: user._id,
      origin: body.origin,
      destination: body.destination,
      distance: Math.round(distance),
      loadType: body.loadType,
      equipmentType: body.equipmentType,
      details: body.details,
      pickupDate,
      deliveryDate,
      pickupTime: body.pickupTime,
      deliveryTime: body.deliveryTime,
      rate: body.rate,
      ratePerMile: distance > 0 ? Math.round((body.rate / distance) * 100) / 100 : 0,
      contactInfo: body.contactInfo,
      referenceNumber: body.referenceNumber,
      postedAt: new Date()
    });

    // Populate shipper information
    await load.populate('shipperId', 'firstName lastName company email phone');

    const response: LoadResponse = {
      success: true,
      message: 'Load created successfully',
      load
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Load creation error:', error.stack || error.message);
      return NextResponse.json(
        {
          success: false,
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } as LoadResponse,
        { status: 500 }
      );
    } else {
      console.error('Load creation error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error'
        } as LoadResponse,
        { status: 500 }
      );
    }
  }
}