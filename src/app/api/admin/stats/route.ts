import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Load from '@/models/Load';
import Offer from '@/models/Offer';

export async function GET() {
  try {
    await connectToDatabase();

    // Get user counts by role
    const [totalUsers, shippers, carriers, drivers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'shipper', isActive: true }),
      User.countDocuments({ role: 'carrier', isActive: true }),
      User.countDocuments({ role: 'driver', isActive: true }),
    ]);

    // Get load statistics
    const [totalLoads, activeLoads, completedLoads] = await Promise.all([
      Load.countDocuments(),
      Load.countDocuments({ status: 'available' }),
      Load.countDocuments({ status: 'delivered' }),
    ]);

    // Get offer statistics
    const [totalOffers, pendingOffers, acceptedOffers] = await Promise.all([
      Offer.countDocuments(),
      Offer.countDocuments({ status: 'pending' }),
      Offer.countDocuments({ status: 'accepted' }),
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentUsers, recentLoads, recentOffers] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Load.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Offer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    // System health check
    const systemStatus = {
      status: 'online',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          shippers,
          carriers,
          drivers,
          recent: recentUsers,
        },
        loads: {
          total: totalLoads,
          active: activeLoads,
          completed: completedLoads,
          recent: recentLoads,
        },
        offers: {
          total: totalOffers,
          pending: pendingOffers,
          accepted: acceptedOffers,
          recent: recentOffers,
        },
        system: systemStatus,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}