import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser } from '@/lib/auth';
import Load from '@/models/Load';
import Offer from '@/models/Offer';

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
        pendingPickupLoads,
        totalLoads,
        deliveredLoads,
        totalRevenue,
        totalMiles,
        recentOffers
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
        }),
        
        // Total loads ever created
        Load.countDocuments({ shipperId: user._id }),
        
        // Delivered loads
        Load.countDocuments({ 
          shipperId: user._id, 
          status: 'delivered' 
        }),
        
        // Total revenue from delivered loads
        Load.aggregate([
          { $match: { shipperId: user._id, status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$rate' } } }
        ]),
        
        // Total miles from all loads
        Load.aggregate([
          { $match: { shipperId: user._id } },
          { $group: { _id: null, total: { $sum: '$distance' } } }
        ]),
        
        // Recent offers on shipper's loads
        Offer.find()
          .populate({
            path: 'loadId',
            match: { shipperId: user._id },
            select: 'loadNumber'
          })
          .populate('carrierId', 'firstName lastName companyName')
          .sort({ createdAt: -1 })
          .limit(5)
      ]);

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
        pendingPickup: pendingPickupLoads,
        totalRevenue: currentRevenue,
        totalMiles: totalMiles[0]?.total || 0,
        revenueGrowth: `${revenueGrowth}%`,
        activeLoadsGrowth: `${activeLoadsGrowth}%`,
        recentActivity: recentOffers
          .filter(offer => offer.loadId) // Only include offers with valid loads
          .map(offer => ({
            type: 'offer_received',
            message: `New ${offer.status} offer from ${offer.carrierId.companyName || `${offer.carrierId.firstName} ${offer.carrierId.lastName}`}`,
            timestamp: offer.submittedAt,
            amount: offer.amount
          }))
      };

    } else if (user.role === 'carrier') {
      // Carrier-specific stats
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
        // Assuming User model exists - you may need to import it
        // User.countDocuments({ isActive: true }),
        0, // Placeholder
        0, // Placeholder  
        0, // Placeholder
        Load.aggregate([
          { $match: { status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$rate' } } }
        ])
      ]);

      stats = {
        totalLoads,
        activeLoads,
        totalUsers: 0, // Placeholder
        totalShippers: 0, // Placeholder
        totalCarriers: 0, // Placeholder
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