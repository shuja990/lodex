'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Truck, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Database,
  Server,
  RefreshCw
} from 'lucide-react';

interface SystemStats {
  users: {
    total: number;
    shippers: number;
    carriers: number;
    drivers: number;
    recent: number;
  };
  loads: {
    total: number;
    active: number;
    completed: number;
    recent: number;
  };
  offers: {
    total: number;
    pending: number;
    accepted: number;
    recent: number;
  };
  system: {
    status: string;
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    timestamp: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName} {user.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadStats} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.users.recent || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.loads.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.loads.total || 0} total loads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.offers.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.offers.accepted || 0} accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-bold ${stats?.system.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.system.status === 'online' ? 'Online' : 'Offline'}
              </div>
              {stats?.system.status === 'online' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {stats?.system ? formatUptime(stats.system.uptime) : '0h 0m'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Role Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Shippers</span>
              <Badge variant="secondary">{stats?.users.shippers || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Carriers</span>
              <Badge variant="secondary">{stats?.users.carriers || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Drivers</span>
              <Badge variant="secondary">{stats?.users.drivers || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Load Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Available</span>
              <Badge variant="outline">{stats?.loads.active || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed</span>
              <Badge variant="default">{stats?.loads.completed || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">New This Week</span>
              <Badge variant="secondary">{stats?.loads.recent || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center">
                <Database className="h-3 w-3 mr-1" />
                Memory Used
              </span>
              <span className="text-sm font-mono">
                {stats?.system ? formatMemory(stats.system.memory.heapUsed) : '0MB'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center">
                <Server className="h-3 w-3 mr-1" />
                Total Memory
              </span>
              <span className="text-sm font-mono">
                {stats?.system ? formatMemory(stats.system.memory.heapTotal) : '0MB'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/admin/users" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/dashboard/admin/loads" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                View All Loads
              </Button>
            </Link>
            <Link href="/dashboard/admin/offers" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Truck className="h-4 w-4 mr-2" />
                View Offers
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>New Users (7 days)</span>
                  <span className="font-medium">{stats.users.recent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Loads (7 days)</span>
                  <span className="font-medium">{stats.loads.recent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Offers (7 days)</span>
                  <span className="font-medium">{stats.offers.recent}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>System Uptime</span>
                    <span className="font-medium">{formatUptime(stats.system.uptime)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading activity data...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}