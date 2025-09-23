'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapboxMap } from '@/components/mapbox';
import { Load } from '@/types/load';
import { IOffer } from '@/types/offer';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatLoadStatus } from '@/lib/utils';

interface LoadWithOffers extends Load {
  offers?: IOffer[];
}

export default function LoadDetailsPage() {
  const { loadId } = useParams();
  const [load, setLoad] = useState<LoadWithOffers | null>(null);
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOffer, setProcessingOffer] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Load data on component mount
  const fetchLoadData = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch load details and offers
      const [loadResponse, offersResponse] = await Promise.all([
        fetchWithAuth(`/api/loads/${loadId}`),
        fetchWithAuth(`/api/loads/${loadId}/offers`)
      ]);

      if (!loadResponse.ok) {
        throw new Error('Failed to fetch load details');
      }

      const loadData = await loadResponse.json();
      setLoad(loadData.load);

      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        setOffers(offersData.offers || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [loadId, isAuthenticated]);

  useEffect(() => {
    if (loadId && isAuthenticated) {
      fetchLoadData();
    }
  }, [loadId, isAuthenticated, fetchLoadData]);

  // Handle accepting or rejecting an offer
  const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
    if (!isAuthenticated) {
      setError('Authentication required');
      return;
    }

    setProcessingOffer(offerId);
    try {
      const response = await fetchWithAuth(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} offer`);
      }

      const result = await response.json();
      
      toast({
        title: "Success!",
        description: result.message || `Offer ${action} successfully.`,
      });

      // Refresh data
      await fetchLoadData();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to ${action} offer`,
        variant: "destructive",
      });
    } finally {
      setProcessingOffer(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading load details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Load Not Found</h2>
            <p className="text-gray-600">The requested load could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-green-100 text-green-800';
  case 'in_transit': return 'bg-yellow-100 text-yellow-800';
  case 'delivered_pending': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOfferStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Load Details</h1>
        <p className="text-gray-600">Load #{load.loadNumber}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Load Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Load Information
                </CardTitle>
                <Badge className={getStatusBadgeColor(load.status)}>
                  {formatLoadStatus(load.status)}
                </Badge>
              </div>
              {load.status === 'delivered_pending' && (
                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      try {
                        const res = await fetchWithAuth(`/api/loads/${load._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'delivered' }) });
                        if (!res.ok) throw new Error('Failed to approve delivery');
                        toast({ title: 'Delivery Approved', description: 'Load marked as delivered.' });
                        fetchLoadData();
                      } catch (e) {
                        toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to approve', variant: 'destructive' });
                      }
                    }}
                  >Approve Delivery</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await fetchWithAuth(`/api/loads/${load._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'in_transit' }) });
                        if (!res.ok) throw new Error('Failed to reject delivery');
                        toast({ title: 'Delivery Rejected', description: 'Returned to In Transit.' });
                        fetchLoadData();
                      } catch (e) {
                        toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to reject', variant: 'destructive' });
                      }
                    }}
                  >Reject Delivery</Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Type:</span>
                  <span>{load.loadType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Equipment:</span>
                  <span>{load.equipmentType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Rate:</span>
                  <span>${load.rate.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Distance:</span>
                  <span>{load.distance} miles</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{load.details.description}</p>
                {load.details.specialInstructions && (
                  <div className="mt-2">
                    <h5 className="font-medium text-sm">Special Instructions</h5>
                    <p className="text-sm text-gray-600">{load.details.specialInstructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Route Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapboxMap
                  height="100%"
                  center={[-98.5795, 39.8283]}
                  zoom={4}
                  markers={[
                    {
                      coordinates: [
                        load.origin.coordinates.longitude,
                        load.origin.coordinates.latitude
                      ] as [number, number],
                      color: '#10B981',
                      popup: `<strong>Pickup:</strong><br/>${load.origin.address}`,
                    },
                    {
                      coordinates: [
                        load.destination.coordinates.longitude,
                        load.destination.coordinates.latitude
                      ] as [number, number],
                      color: '#EF4444',
                      popup: `<strong>Delivery:</strong><br/>${load.destination.address}`,
                    }
                  ]}
                  route={[
                    [load.origin.coordinates.longitude, load.origin.coordinates.latitude],
                    [load.destination.coordinates.longitude, load.destination.coordinates.latitude]
                  ]}
                  bounds={[
                    [
                      Math.min(load.origin.coordinates.longitude, load.destination.coordinates.longitude) - 0.1,
                      Math.min(load.origin.coordinates.latitude, load.destination.coordinates.latitude) - 0.1
                    ],
                    [
                      Math.max(load.origin.coordinates.longitude, load.destination.coordinates.longitude) + 0.1,
                      Math.max(load.origin.coordinates.latitude, load.destination.coordinates.latitude) + 0.1
                    ]
                  ]}
                  fitBounds={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Pickup</h4>
                  <p className="text-sm text-gray-600 mb-1">{load.origin.address}</p>
                  <p className="font-medium">{new Date(load.pickupDate).toLocaleDateString()}</p>
                  {load.pickupTime && <p className="text-sm text-gray-600">{load.pickupTime}</p>}
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Delivery</h4>
                  <p className="text-sm text-gray-600 mb-1">{load.destination.address}</p>
                  <p className="font-medium">{new Date(load.deliveryDate).toLocaleDateString()}</p>
                  {load.deliveryTime && <p className="text-sm text-gray-600">{load.deliveryTime}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Offers and Contact Info */}
        <div className="space-y-6">
          {/* Offers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Offers ({offers.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No offers yet</p>
                  <p className="text-sm text-gray-500">Carriers will see your load and make offers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getOfferStatusIcon(offer.status)}
                          <span className="font-medium text-lg">${offer.amount.toLocaleString()}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {offer.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {offer.carrierId?.companyName || `${offer.carrierId?.firstName || "Unknown"} ${offer.carrierId?.lastName || "Carrier"}`}
                          </span>
                        </div>
                        
                        {offer.carrierId?.mcNumber && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">MC: {offer.carrierId?.mcNumber}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{offer.carrierId?.phone || "No phone available"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{offer.carrierId?.email || "No email available"}</span>
                        </div>
                      </div>

                      {offer.message && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm">{offer.message}</p>
                        </div>
                      )}

                      {offer.status === 'pending' && load.status === 'posted' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOfferAction(offer._id, 'accepted')}
                            disabled={processingOffer === offer._id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingOffer === offer._id ? 'Processing...' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOfferAction(offer._id, 'rejected')}
                            disabled={processingOffer === offer._id}
                            className="flex-1"
                          >
                            {processingOffer === offer._id ? 'Processing...' : 'Reject'}
                          </Button>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Submitted {new Date(offer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Pickup Contact</h4>
                <div className="space-y-1">
                  <p className="font-medium">{load.contactInfo.pickup.name}</p>
                  <p className="text-sm text-gray-600">{load.contactInfo.pickup.phone}</p>
                  {load.contactInfo.pickup.email && (
                    <p className="text-sm text-gray-600">{load.contactInfo.pickup.email}</p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-red-600 mb-2">Delivery Contact</h4>
                <div className="space-y-1">
                  <p className="font-medium">{load.contactInfo.delivery.name}</p>
                  <p className="text-sm text-gray-600">{load.contactInfo.delivery.phone}</p>
                  {load.contactInfo.delivery.email && (
                    <p className="text-sm text-gray-600">{load.contactInfo.delivery.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}