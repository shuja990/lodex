'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Load, LoadStatus } from '@/types/load';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  DollarSign, 
  Package,
  Clock,
  User,
  Phone,
  MessageSquare
} from 'lucide-react';
import dynamic from 'next/dynamic';
const LoadChat = dynamic(() => import('@/components/chat/load-chat'), { ssr: false });
import { MapboxMap } from '@/components/mapbox';

export default function AssignedLoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Fetch assigned loads
  const fetchAssignedLoads = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithAuth('/api/loads?assigned=true&sortBy=assignedAt&sortOrder=desc');

      if (!response.ok) {
        throw new Error('Failed to fetch assigned loads');
      }

      const data = await response.json();
      setLoads(data.loads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Update load status
  const handleStatusUpdate = async (loadId: string, newStatus: string) => {
    setUpdatingStatus(loadId);
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithAuth(`/api/loads/${loadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Update the specific load in state instead of full refetch
      setLoads(prevLoads => 
        prevLoads.map(load => 
          load._id === loadId 
            ? { 
                ...load, 
                status: newStatus as LoadStatus,
                ...(newStatus === 'in_transit' && { pickedUpAt: new Date() }),
                ...(newStatus === 'delivered_pending' && { deliveredAt: new Date() })
              }
            : load
        )
      );
      
      toast({
        title: "Success",
        description: "Load status updated successfully",
      });
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update status',
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssignedLoads();
    }
  }, [isAuthenticated, fetchAssignedLoads]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered_pending': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'assigned':
        return ['in_transit'];
      case 'in_transit':
        return ['delivered_pending'];
      case 'delivered_pending':
        return []; // Await shipper action
      default:
        return [];
    }
  };

  // Format a timestamp with both date & time so changes are visible even within the same day
  const formatTimestamp = (value: unknown) => {
    if (!value) return '—';
    const dateVal = typeof value === 'string' || value instanceof Date ? value : undefined;
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    // Use a short, consistent format (you can refine locale/options later if desired)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assigned loads...</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Assigned Loads</h1>
        <p className="text-gray-600">Manage and update status of your assigned loads</p>
      </div>

      {loads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assigned Loads</h3>
            <p className="text-gray-600">You don&apos;t have any assigned loads at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {loads.map((load) => (
            <Card key={load._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Load #{load.loadNumber}</CardTitle>
                  <Badge className={getStatusBadgeColor(load.status)}>
                    {load.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Route Information */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-600">Pickup Location</p>
                            <p className="text-sm text-gray-600">{load.origin.address}</p>
                            <p className="text-sm text-gray-500">{load.origin.city}, {load.origin.state} {load.origin.zipCode}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-600">Delivery Location</p>
                            <p className="text-sm text-gray-600">{load.destination.address}</p>
                            <p className="text-sm text-gray-500">{load.destination.city}, {load.destination.state} {load.destination.zipCode}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Equipment</p>
                          <p className="font-medium">{load.equipmentType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Weight</p>
                          <p className="font-medium">{load.details.weight} lbs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Distance</p>
                          <p className="font-medium">{load.distance} mi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Rate</p>
                          <p className="font-medium">${load.rate.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Pickup Date</p>
                          <p className="font-medium">{new Date(load.pickupDate).toLocaleDateString()}</p>
                          {load.pickupTime && <p className="text-gray-500">{load.pickupTime}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Delivery Date</p>
                          <p className="font-medium">{new Date(load.deliveryDate).toLocaleDateString()}</p>
                          {load.deliveryTime && <p className="text-gray-500">{load.deliveryTime}</p>}
                        </div>
                      </div>
                    </div>

                    {load.details.description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-sm">{load.details.description}</p>
                      </div>
                    )}

                    {load.details.specialInstructions && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Special Instructions</p>
                        <p className="text-sm text-orange-600">{load.details.specialInstructions}</p>
                      </div>
                    )}
                    
                    {/* Load Route Map */}
                    <div className="mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Route Map
                      </h4>
                      <div className="rounded-lg overflow-hidden border">
                        <MapboxMap
                          height="400px"
                          center={[
                            (load.origin.coordinates.longitude + load.destination.coordinates.longitude) / 2,
                            (load.origin.coordinates.latitude + load.destination.coordinates.latitude) / 2
                          ]}
                          zoom={6}
                          markers={[
                            {
                              coordinates: [
                                load.origin.coordinates.longitude,
                                load.origin.coordinates.latitude,
                              ] as [number, number],
                              color: "#10B981",
                              id: `origin-${load._id}`,
                              popup: `Pickup: ${load.origin.city}, ${load.origin.state}`
                            },
                            {
                              coordinates: [
                                load.destination.coordinates.longitude,
                                load.destination.coordinates.latitude,
                              ] as [number, number],
                              color: "#EF4444",
                              id: `destination-${load._id}`,
                              popup: `Delivery: ${load.destination.city}, ${load.destination.state}`
                            }
                          ]}
                          route={[
                            [load.origin.coordinates.longitude, load.origin.coordinates.latitude],
                            [load.destination.coordinates.longitude, load.destination.coordinates.latitude]
                          ]}
                          bounds={[
                            [
                              Math.min(load.origin.coordinates.longitude, load.destination.coordinates.longitude) - 0.3,
                              Math.min(load.origin.coordinates.latitude, load.destination.coordinates.latitude) - 0.3
                            ],
                            [
                              Math.max(load.origin.coordinates.longitude, load.destination.coordinates.longitude) + 0.3,
                              Math.max(load.origin.coordinates.latitude, load.destination.coordinates.latitude) + 0.3
                            ]
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information, Status Update & Chat */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Contact Information</h4>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-medium text-green-700 mb-2">Pickup Contact</h5>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{load.contactInfo.pickup.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{load.contactInfo.pickup.phone}</span>
                          </div>
                          {load.contactInfo.pickup.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{load.contactInfo.pickup.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-medium text-red-700 mb-2">Delivery Contact</h5>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{load.contactInfo.delivery.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{load.contactInfo.delivery.phone}</span>
                          </div>
                          {load.contactInfo.delivery.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{load.contactInfo.delivery.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    {getNextStatus(load.status).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Update Status</h4>
                        <div className="space-y-2">
                          {getNextStatus(load.status).map((status) => (
                            <Button
                              key={status}
                              className="w-full"
                              onClick={() => handleStatusUpdate(load._id!, status)}
                              disabled={updatingStatus === load._id}
                            >
                                {updatingStatus === load._id
                                  ? 'Updating...'
                                  : status === 'in_transit'
                                    ? 'Mark Picked Up'
                                    : status === 'delivered_pending'
                                      ? 'Mark Delivered (Request Approval)'
                                      : status === 'delivered'
                                        ? 'Delivered'
                                        : `Mark as ${status.replace('_', ' ')}`}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chat section */}
                    {load.status !== 'delivered' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <h4 className="font-medium">Chat</h4>
                        </div>
                        <LoadChat loadId={load._id!} />
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span title={load.assignedAt ? new Date(load.assignedAt).toISOString() : ''}>
                          Assigned: {formatTimestamp(load.assignedAt)}
                        </span>
                      </div>
                      {load.pickedUpAt && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span title={new Date(load.pickedUpAt).toISOString()}>
                            Picked up: {formatTimestamp(load.pickedUpAt)}
                          </span>
                        </div>
                      )}
                      {load.deliveredAt && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span title={new Date(load.deliveredAt).toISOString()}>
                            Delivered: {formatTimestamp(load.deliveredAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}