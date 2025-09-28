'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Load } from '@/types/load';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  DollarSign, 
  Package,
  Clock,
  Eye,
  Plus,
  AlertCircle,
  Edit
} from 'lucide-react';

export default function ShipperLoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Fetch shipper's loads
  const fetchLoads = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithAuth('/api/loads?sortBy=postedAt&sortOrder=desc');

      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }

      const data = await response.json();
      setLoads(data.loads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoads();
    }
  }, [isAuthenticated, fetchLoads]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'posted': return 'Available for Offers';
      case 'assigned': return 'Carrier Assigned';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your loads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Loads</h1>
          <p className="text-gray-600">Manage your posted loads and view offers</p>
        </div>
        <Link href="/dashboard/shipper/post-load">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Post New Load
          </Button>
        </Link>
      </div>

      {loads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Loads Posted</h3>
            <p className="text-gray-600 mb-4">You haven&apos;t posted any loads yet. Start by creating your first load.</p>
            <Link href="/dashboard/shipper/post-load">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Load
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loads.map((load) => (
            <Card key={load._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Load #{load.loadNumber}</CardTitle>
                  <Badge className={getStatusBadgeColor(load.status)}>
                    {getStatusText(load.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-green-600">Pickup</p>
                      <p className="text-sm text-gray-600 truncate">{load.origin.city}, {load.origin.state}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-red-600">Delivery</p>
                      <p className="text-sm text-gray-600 truncate">{load.destination.city}, {load.destination.state}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span>{load.equipmentType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>{load.details.weight} lbs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{load.distance} mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>${load.rate.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Pickup: {new Date(load.pickupDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Posted: {new Date(load.postedAt).toLocaleDateString()}</span>
                </div>

                {load.details.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{load.details.description}</p>
                )}

                <div className="space-y-2">
                  <Link href={`/dashboard/shipper/loads/${load._id}`}>   
                    <Button className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details & Offers
                    </Button>
                  </Link>
                  { !load.carrierId && (
                    <Link href={`/dashboard/shipper/loads/${load._id}/edit`}>   
                      <Button variant="outline" className="w-full mt-2">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Load
                      </Button>
                    </Link>
                  ) }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}