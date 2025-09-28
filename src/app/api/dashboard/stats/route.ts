import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Load from '@/models/Load';
import Offer from '@/models/Offer';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    let stats = {};

    if (user.role === 'shipper') {
      // Shipper-specific stats
      const [
        activeLoads,
        pendingPickupLoads
      ] = await Promise.all([
        // Active loads (posted, assigned, in_transit)
        Load.countDocuments({ 
          shipperId: user._id, 
          status: { $in: ['posted', 'assigned', 'in_transit'] } 
        }),
        
        // Pending pickup (assigned but not picked up)
        Load.countDocuments({ 
          shipperId: user._id, 
          status: 'assigned' 
        })
      ]);

      // Get additional data separately
      const totalRevenue = await Load.aggregate([
        { 
          $match: { 
            shipperId: user._id, 
            status: 'delivered' 
          } 
        },
        { $group: { _id: null, total: { $sum: '$rate' } } }
      ]);

      const totalMiles = await Load.aggregate([
        { $match: { shipperId: user._id } },
        { $group: { _id: null, total: { $sum: '$distance' } } }
      ]);

      const recentOffers = await Offer.find()
        .populate({
          path: 'loadId',
          match: { shipperId: user._id },
          select: 'loadNumber'
        })
        .populate('carrierId', 'firstName lastName companyName')
        .sort({ createdAt: -1 })
        .limit(5);

      // Calculate previous month stats for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const [prevMonthActiveLoads, prevMonthRevenue] = await Promise.all([
        Load.countDocuments({ 
          shipperId: user._id, 
          status: { $in: ['posted', 'assigned', 'in_transit'] },
          createdAt: { $gte: lastMonth }
        }),
        
        Load.aggregate([
          { 
            $match: { 
              shipperId: user._id, 
              status: 'delivered',
              deliveredAt: { $gte: lastMonth }
            } 
          },
          { $group: { _id: null, total: { $sum: '$rate' } } }
        ])
      ]);

      const currentRevenue = totalRevenue[0]?.total || 0;
      const prevRevenue = prevMonthRevenue[0]?.total || 0;
      const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : '0';
      const activeLoadsGrowth = prevMonthActiveLoads > 0 ? ((activeLoads - prevMonthActiveLoads) / prevMonthActiveLoads * 100).toFixed(1) : '0';

      stats = {
        activeLoads,
        pendingPickups: pendingPickupLoads,
        totalRevenue: currentRevenue,
        totalMiles: totalMiles[0]?.total || 0,
        revenueGrowth: parseFloat(revenueGrowth),
        activeLoadsGrowth: parseFloat(activeLoadsGrowth),
        milesGrowth: 0, // Can be calculated if needed
        recentOffers: recentOffers
          .filter(offer => offer.loadId) // Only include offers with valid loads
          .map(offer => ({
            id: offer._id.toString(),
            carrierName: offer.carrierId.companyName || `${offer.carrierId.firstName} ${offer.carrierId.lastName}`,
            rate: offer.amount,
            timestamp: offer.submittedAt,
            loadNumber: offer.loadId.loadNumber
          }))
      };

    } else if (user.role === 'carrier' || user.role === 'driver') {
      // Carrier/Driver-specific stats
      const [
        assignedLoads,
        availableLoads,
        completedLoads,
        totalEarnings,
        totalMiles,
        pendingOffers
      ] = await Promise.all([
        // Loads assigned to this carrier
        Load.countDocuments({ 
          carrierId: user._id, 
          status: { $in: ['assigned', 'in_transit'] } 
        }),
        
        // Available loads (posted status)
        Load.countDocuments({ status: 'posted' }),
        
        // Completed loads by this carrier
        Load.countDocuments({ 
          carrierId: user._id, 
          status: 'delivered' 
        }),
        
        // Total earnings from completed loads
        Load.aggregate([
          { $match: { carrierId: user._id, status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$rate' } } }
        ]),
        
        // Total miles driven
        Load.aggregate([
          { $match: { carrierId: user._id, status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$distance' } } }
        ]),
        
        // Pending offers by this carrier
        Offer.countDocuments({ 
          carrierId: user._id, 
          status: 'pending' 
        })
      ]);

      stats = {
        assignedLoads,
        availableLoads,
        completedLoads,
        totalEarnings: totalEarnings[0]?.total || 0,
        totalMiles: totalMiles[0]?.total || 0,
        pendingOffers,
        recentActivity: [] // Can be populated with recent load assignments, deliveries, etc.
      };

    } else if (user.role === 'admin') {
      // Admin-specific stats
      const [
        totalLoads,
        activeLoads,
        totalUsers,
        totalShippers,
        totalCarriers,
        totalRevenue
      ] = await Promise.all([
        Load.countDocuments(),
        Load.countDocuments({ status: { $in: ['posted', 'assigned', 'in_transit'] } }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'shipper', isActive: true }),
        User.countDocuments({ role: { $in: ['carrier', 'driver'] }, isActive: true }),
        Load.aggregate([
          { $match: { status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$rate' } } }
        ])
      ]);

      stats = {
        totalLoads,
        activeLoads,
        totalUsers,
        totalShippers,
        totalCarriers,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentActivity: [] // Can be populated with recent system activity
      };
    }

    return NextResponse.json({ 
      success: true, 
      stats,
      role: user.role 
    });

  } catch (error: unknown) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}