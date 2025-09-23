'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Truck
} from 'lucide-react';

interface Offer {
  _id: string;
  loadId: {
    _id: string;
    loadNumber: string;
    origin: {
      city: string;
      state: string;
      address: string;
    };
    destination: {
      city: string;
      state: string;
      address: string;
    };
    equipmentType: string;
    distance: number;
    rate: number;
    pickupDate: string;
    status: string;
  };
  carrierId: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

export default function CarrierOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  

  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Fetch carrier's offers
  const fetchOffers = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithAuth('/api/offers/my-offers');

      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }

      const data = await response.json();
      setOffers(data.offers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOffers();
    }
  }, [isAuthenticated, fetchOffers]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <HelpCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoadStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingOffers = offers.filter(offer => offer.status === 'pending');
  const respondedOffers = offers.filter(offer => offer.status !== 'pending');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
        <p className="text-gray-600">Track your submitted offers and their status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <HelpCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOffers.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.filter(o => o.status === 'accepted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Won loads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {respondedOffers.length > 0 
                ? `${Math.round((offers.filter(o => o.status === 'accepted').length / respondedOffers.length) * 100)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Acceptance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Offers Yet</h3>
            <p className="text-gray-600 mb-4">You haven&apos;t submitted any offers yet.</p>
            <Button asChild>
              <a href="/dashboard/carrier/loads">Browse Available Loads</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Pending Offers */}
          {pendingOffers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-yellow-700">
                Pending Offers ({pendingOffers.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingOffers.map((offer) => (
                  <Card key={offer._id} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Load #{offer.loadId?.loadNumber || "N/A"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(offer.status)}
                          <Badge className={getStatusBadgeColor(offer.status)}>
                            {offer.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-green-600">From</p>
                            <p className="text-sm text-gray-600">
                              {offer.loadId?.origin?.city || "N/A"}, {offer.loadId?.origin?.state || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-red-600">To</p>
                            <p className="text-sm text-gray-600">
                              {offer.loadId?.destination?.city || "N/A"}, {offer.loadId?.destination?.state || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span>{offer.loadId?.equipmentType || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{offer.loadId?.distance || 0} mi</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Pickup: {new Date(offer.loadId.pickupDate).toLocaleDateString()}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Posted Rate</p>
                          <p className="font-bold text-gray-900">
                            ${(offer.loadId?.rate || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Your Offer</p>
                          <p className="font-bold text-blue-600">
                            ${offer.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {offer.message && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Your Message</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{offer.message}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Submitted: {new Date(offer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Responded Offers */}
          {respondedOffers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Previous Offers ({respondedOffers.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {respondedOffers.map((offer) => (
                  <Card key={offer._id} className={`border-l-4 ${
                    offer.status === 'accepted' ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Load #{offer.loadId?.loadNumber || "N/A"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(offer.status)}
                          <Badge className={getStatusBadgeColor(offer.status)}>
                            {offer.status.toUpperCase()}
                          </Badge>
                          <Badge className={getLoadStatusBadgeColor(offer.loadId.status)}>
                            {offer.loadId.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-green-600">From</p>
                            <p className="text-sm text-gray-600">
                              {offer.loadId?.origin?.city || "N/A"}, {offer.loadId?.origin?.state || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-red-600">To</p>
                            <p className="text-sm text-gray-600">
                              {offer.loadId?.destination?.city || "N/A"}, {offer.loadId?.destination?.state || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span>{offer.loadId?.equipmentType || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{offer.loadId?.distance || 0} mi</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Posted Rate</p>
                          <p className="font-bold text-gray-900">
                            ${(offer.loadId?.rate || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Your Offer</p>
                          <p className={`font-bold ${
                            offer.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${offer.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {offer.message && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Your Message</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{offer.message}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Submitted: {new Date(offer.createdAt).toLocaleDateString()}</span>
                        </div>
                        {offer.respondedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Responded: {new Date(offer.respondedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}