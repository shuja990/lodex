'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatLoadStatus } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Load } from '@/types/load';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  DollarSign, 
  Package,
  Clock,
  Plus,
  Navigation,
  Filter
} from 'lucide-react';
import { MapboxMap } from '@/components/mapbox';

import AddressAutocomplete from '@/components/mapbox/AddressAutocomplete';
import { LoadLocation } from '@/types/load';

interface LoadWithDistance extends Load {
  distanceFromCarrier?: number;
}

export default function CarrierLoadsPage() {
  // Route filter state (must be inside component)
  const [routeStart, setRouteStart] = useState<LoadLocation | null>(null);
  const [routeEnd, setRouteEnd] = useState<LoadLocation | null>(null);
  const [loads, setLoads] = useState<LoadWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'postedAt' | 'distance' | 'rate' | 'pickupDate'>('distance');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<string>('');
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Stable memoized route elements for the currently selected load (prevents map redraw while typing)
  const markersMemo = useMemo(() => {
    if (!selectedLoad) return [] as { coordinates: [number, number]; color: string; popup: string }[];
    
    const originLng = selectedLoad.origin.coordinates.longitude;
    const originLat = selectedLoad.origin.coordinates.latitude;
    const destLng = selectedLoad.destination.coordinates.longitude;
    const destLat = selectedLoad.destination.coordinates.latitude;
    
    const markers = [];
    
    // Only add origin marker if coordinates are valid
    if (originLng && originLat && originLng !== 0 && originLat !== 0) {
      markers.push({
        coordinates: [originLng, originLat] as [number, number],
        color: '#10B981',
        popup: `<strong>Pickup:</strong><br/>${selectedLoad.origin.city}, ${selectedLoad.origin.state}`
      });
    }
    
    // Only add destination marker if coordinates are valid
    if (destLng && destLat && destLng !== 0 && destLat !== 0) {
      markers.push({
        coordinates: [destLng, destLat] as [number, number],
        color: '#EF4444',
        popup: `<strong>Delivery:</strong><br/>${selectedLoad.destination.city}, ${selectedLoad.destination.state}`
      });
    }
    
    console.log('Markers data for offer modal:', markers);
    return markers;
  }, [selectedLoad]);

  const routeMemo = useMemo(() => {
    if (!selectedLoad) return [] as [number, number][];
    
    const originLng = selectedLoad.origin.coordinates.longitude;
    const originLat = selectedLoad.origin.coordinates.latitude;
    const destLng = selectedLoad.destination.coordinates.longitude;
    const destLat = selectedLoad.destination.coordinates.latitude;
    
    // Validate coordinates
    if (!originLng || !originLat || !destLng || !destLat ||
        originLng === 0 || originLat === 0 || destLng === 0 || destLat === 0) {
      console.warn('Invalid route coordinates:', { originLng, originLat, destLng, destLat });
      return [] as [number, number][];
    }
    
    const route = [
      [originLng, originLat],
      [destLng, destLat]
    ] as [number, number][];
    
    console.log('Route data for offer modal:', route);
    return route;
  }, [selectedLoad]);

  const boundsMemo = useMemo(() => {
    if (!selectedLoad) return undefined;
    return [
      [
        Math.min(selectedLoad.origin.coordinates.longitude, selectedLoad.destination.coordinates.longitude) - 0.1,
        Math.min(selectedLoad.origin.coordinates.latitude, selectedLoad.destination.coordinates.latitude) - 0.1
      ],
      [
        Math.max(selectedLoad.origin.coordinates.longitude, selectedLoad.destination.coordinates.longitude) + 0.1,
        Math.max(selectedLoad.origin.coordinates.latitude, selectedLoad.destination.coordinates.latitude) + 0.1
      ]
    ] as [[number, number],[number, number]];
  }, [selectedLoad]);

  // Child component to isolate map from parent re-renders while typing
  const OfferRouteMap = React.useMemo(() => {
    if (!selectedLoad) return null;
    const markers = markersMemo;
    const route = routeMemo;
    const bounds = boundsMemo;
    return (
      <div className="rounded-md overflow-hidden border">
        <div className="h-64 w-full">
          <MapboxMap
            key={`offer-map-${selectedLoad._id}`}
            height="100%"
            markers={markers}
            route={route}
            bounds={bounds}
            fitBounds
          />
        </div>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLoad?._id]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get user location:', error);
        }
      );
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch available loads
  const fetchLoads = useCallback(async (isFiltering = false) => {
    if (isFiltering) {
      setFiltering(true);
    } else {
      setLoading(true);
    }
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Build query parameters
      const params = new URLSearchParams({
        status: 'posted',
        sortBy,
        sortOrder: 'desc'
      });

      if (equipmentFilter !== 'all') {
        params.set('equipmentType', equipmentFilter);
      }

      if (maxDistance) {
        params.set('maxDistance', maxDistance);
      }

      // Always include user location if available for distance calculation
      if (userLocation) {
        params.set('userLat', userLocation.lat.toString());
        params.set('userLng', userLocation.lng.toString());
        if (maxDistance) {
          params.set('radius', maxDistance);
        }
      }
      // If route filter is set, add route params
      if (routeStart && routeEnd) {
        params.set('routeStartLat', routeStart.coordinates.latitude.toString());
        params.set('routeStartLng', routeStart.coordinates.longitude.toString());
        params.set('routeEndLat', routeEnd.coordinates.latitude.toString());
        params.set('routeEndLng', routeEnd.coordinates.longitude.toString());
      }

      const response = await fetchWithAuth(`/api/loads?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }

      const data = await response.json();
      let fetchedLoads = data.loads || [];

      // Always calculate distance from carrier if location is available
      if (userLocation) {
        fetchedLoads = fetchedLoads.map((load: Load) => ({
          ...load,
          distanceFromCarrier: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            load.origin.coordinates.latitude,
            load.origin.coordinates.longitude
          )
        }));
      }
      
      // Apply sorting based on selected criteria
      if (sortBy === 'distance' && userLocation) {
        fetchedLoads.sort((a: LoadWithDistance, b: LoadWithDistance) => 
          (a.distanceFromCarrier || Infinity) - (b.distanceFromCarrier || Infinity)
        );
      } else if (sortBy === 'rate') {
        fetchedLoads.sort((a: Load, b: Load) => b.rate - a.rate);
      } else if (sortBy === 'pickupDate') {
        fetchedLoads.sort((a: Load, b: Load) => 
          new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
        );
      } else if (sortBy === 'postedAt') {
        fetchedLoads.sort((a: Load, b: Load) => 
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        );
      }

      setLoads(fetchedLoads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      if (isFiltering) {
        setFiltering(false);
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, sortBy, equipmentFilter, maxDistance, userLocation, routeStart, routeEnd]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoads();
    }
  }, [isAuthenticated, fetchLoads]);

  // Submit an offer
  const handleSubmitOffer = async () => {
    if (!selectedLoad || !offerAmount) {
      return;
    }

    setSubmittingOffer(true);
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithAuth(`/api/loads/${selectedLoad._id}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(offerAmount),
          message: offerMessage || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit offer');
      }

      // Reset form and close modal
      setSelectedLoad(null);
      setOfferAmount('');
      setOfferMessage('');
      
      toast({
        title: "Success!",
        description: "Your offer has been submitted successfully.",
      });
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit offer',
        variant: "destructive",
      });
    } finally {
      setSubmittingOffer(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available loads...</p>
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
            <Button onClick={() => fetchLoads(false)} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Loads</h1>
        <p className="text-gray-600">Browse and make offers on available loads</p>
      </div>

      {/* Filters */}
      {/* Route Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Filter Loads by Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Route Start</Label>
              <AddressAutocomplete
                value={routeStart ?? undefined}
                onChange={setRouteStart}
                placeholder="Enter starting city"
                types="place"
              />
            </div>
            <div>
              <Label>Route End</Label>
              <AddressAutocomplete
                value={routeEnd ?? undefined}
                onChange={setRouteEnd}
                placeholder="Enter ending city"
                types="place"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => fetchLoads(true)} disabled={!routeStart || !routeEnd || filtering}>
              {filtering ? 'Applying...' : 'Apply Route Filter'}
            </Button>
            <Button variant="outline" onClick={() => { setRouteStart(null); setRouteEnd(null); fetchLoads(true); }} disabled={filtering}>
              Clear Route Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Sorting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: 'postedAt' | 'distance' | 'rate' | 'pickupDate') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance" disabled={!userLocation}>
                    {userLocation ? 'Distance from Me (Default)' : 'Distance from Me (Location Required)'}
                  </SelectItem>
                  <SelectItem value="postedAt">Recently Posted</SelectItem>
                  <SelectItem value="rate">Highest Rate</SelectItem>
                  <SelectItem value="pickupDate">Pickup Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="equipmentFilter">Equipment Type</Label>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  <SelectItem value="dry_van">Dry Van</SelectItem>
                  <SelectItem value="refrigerated">Refrigerated</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="step_deck">Step Deck</SelectItem>
                  <SelectItem value="lowboy">Lowboy</SelectItem>
                  <SelectItem value="box_truck">Box Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxDistance">Max Distance (miles)</Label>
              <Input
                id="maxDistance"
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                placeholder="Any distance"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => fetchLoads(true)} className="w-full" disabled={filtering}>
                {filtering ? 'Applying...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Available Loads</h3>
            <p className="text-gray-600">There are currently no loads available matching your criteria.</p>
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
                    {formatLoadStatus(load.status)}
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

                {load.distanceFromCarrier && (
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">
                      {Math.round(load.distanceFromCarrier)} miles from you
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Pickup: {new Date(load.pickupDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Posted: {new Date(load.postedAt).toLocaleDateString()}</span>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setSelectedLoad(load)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Make Offer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {selectedLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Make an Offer</CardTitle>
              <p className="text-sm text-gray-600">Load #{selectedLoad.loadNumber}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm"><strong>Route:</strong> {selectedLoad.origin.city}, {selectedLoad.origin.state} → {selectedLoad.destination.city}, {selectedLoad.destination.state}</p>
                <p className="text-sm"><strong>Distance:</strong> {selectedLoad.distance} miles</p>
                <p className="text-sm"><strong>Posted Rate:</strong> ${selectedLoad.rate.toLocaleString()}</p>
                <p className="text-sm"><strong>Equipment:</strong> {selectedLoad.equipmentType}</p>
              </div>

              {/* Route Map (stable arrays so typing price doesn't trigger map changes) */}
              {OfferRouteMap}

              <div className="space-y-2">
                <Label htmlFor="offerAmount">Your Offer Amount ($) *</Label>
                <Input
                  id="offerAmount"
                  type="number"
                  step="0.01"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter your bid amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerMessage">Message (Optional)</Label>
                <Textarea
                  id="offerMessage"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add a message to the shipper..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedLoad(null);
                    setOfferAmount('');
                    setOfferMessage('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitOffer}
                  disabled={!offerAmount || submittingOffer}
                >
                  {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
