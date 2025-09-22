'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapboxMap } from '@/components/mapbox';
import { getCurrentLocation, calculateDistance } from '@/lib/geolocation';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  Clock,
  Filter,
  Locate,
  Map,
  List,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { Load } from '@/types/load';

// Extended Load type with computed distance
interface LoadWithDistance extends Load {
  distanceFromUser?: number;
}

interface CarrierLoadsListProps {
  onViewLoad?: (load: LoadWithDistance) => void;
}

type ViewMode = 'list' | 'map';
type SortOption = 'distance' | 'rate' | 'pickup_date';

export default function CarrierLoadsList({ onViewLoad }: CarrierLoadsListProps) {
  const { token } = useAuthStore();
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<LoadWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLoad, setSelectedLoad] = useState<LoadWithDistance | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(500); // miles
  const [minRate, setMinRate] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<number>(10000);
  const [equipmentType, setEquipmentType] = useState<string>('');
  const [loadType, setLoadType] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  // Get user's current location
  const getUserLocation = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setLocationError(null);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to access your location. Distance filtering will be disabled.');
    }
  }, []);

  // Fetch loads from API
  const fetchLoads = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        status: 'posted', // Only show available loads
        limit: '100' // Get more loads for carriers to browse
      });

      const response = await fetch(`/api/loads?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch loads');
      }

      const data = await response.json();
      if (data.success) {
        setLoads(data.loads);
      } else {
        throw new Error('Failed to fetch loads');
      }
    } catch (error) {
      console.error('Error fetching loads:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch loads');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Apply filters to loads
  const applyFilters = useCallback(() => {
    let filtered = [...loads];

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(load => 
        load.origin.city?.toLowerCase().includes(searchLower) ||
        load.origin.state?.toLowerCase().includes(searchLower) ||
        load.destination.city?.toLowerCase().includes(searchLower) ||
        load.destination.state?.toLowerCase().includes(searchLower) ||
        load.details.description?.toLowerCase().includes(searchLower) ||
        load.loadNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Equipment type filter
    if (equipmentType) {
      filtered = filtered.filter(load => load.equipmentType === equipmentType);
    }

    // Load type filter
    if (loadType) {
      filtered = filtered.filter(load => load.loadType === loadType);
    }

    // Rate filter
    filtered = filtered.filter(load => load.rate >= minRate && load.rate <= maxRate);

    // Distance filter (if user location is available)
    if (userLocation && maxDistance < 500) {
      filtered = filtered.filter(load => {
        if (!load.origin.coordinates) return false;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          load.origin.coordinates.latitude,
          load.origin.coordinates.longitude
        );
        return distance <= maxDistance;
      });
    }

    // Add distance to each load for sorting
    const filteredWithDistance = userLocation ? filtered.map(load => ({
      ...load,
      distanceFromUser: load.origin.coordinates ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        load.origin.coordinates.latitude,
        load.origin.coordinates.longitude
      ) : Infinity
    })) : filtered.map(load => ({ ...load, distanceFromUser: undefined }));

    // Sort loads
    filteredWithDistance.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!userLocation) return 0;
          return (a.distanceFromUser || Infinity) - (b.distanceFromUser || Infinity);
        case 'rate':
          return b.rate - a.rate; // Highest rate first
        case 'pickup_date':
          return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredLoads(filteredWithDistance);
  }, [loads, searchTerm, equipmentType, loadType, minRate, maxRate, maxDistance, userLocation, sortBy]);

  // Load data on component mount
  useEffect(() => {
    fetchLoads();
    getUserLocation();
  }, [fetchLoads, getUserLocation]);

  // Apply filters when any filter state changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const formatDistance = (distance?: number) => {
    if (distance === undefined || distance === Infinity) return 'N/A';
    return `${Math.round(distance)} mi`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLoadSelect = (load: LoadWithDistance) => {
    setSelectedLoad(load);
    if (onViewLoad) {
      onViewLoad(load);
    }
  };

  const renderMapView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Map */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <MapboxMap
              height="100%"
              markers={filteredLoads
                .filter(load => load.origin.coordinates)
                .map(load => ({
                  coordinates: [
                    load.origin.coordinates!.longitude,
                    load.origin.coordinates!.latitude
                  ] as [number, number],
                  id: load._id,
                  popup: `${load.origin.city}, ${load.origin.state} - $${load.rate.toLocaleString()}`
                }))}
              userLocation={userLocation}
              showUserLocation={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Load Details Sidebar */}
      <div className="space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Available Loads</h3>
          <Badge variant="outline">{filteredLoads.length} loads</Badge>
        </div>

        {filteredLoads.map((load) => (
          <Card 
            key={load._id} 
            className={`cursor-pointer transition-colors ${
              selectedLoad?._id === load._id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleLoadSelect(load)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(load.status)}>
                    {load.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-lg font-bold text-green-600">
                    ${load.rate.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-green-600 mr-1" />
                    <span className="font-medium">
                      {load.origin.city}, {load.origin.state}
                    </span>
                    {userLocation && load.distanceFromUser !== undefined && (
                      <span className="ml-2 text-gray-500">
                        ({formatDistance(load.distanceFromUser)})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm">
                    <Navigation className="h-4 w-4 text-red-600 mr-1" />
                    <span>{load.destination.city}, {load.destination.state}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(load.pickupDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    {load.equipmentType}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredLoads.map((load) => (
        <Card key={load._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Load Info */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(load.status)}>
                      {load.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500">#{load.loadNumber}</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    ${load.rate.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium">
                      {load.origin.address && `${load.origin.address}, `}
                      {load.origin.city}, {load.origin.state} {load.origin.zipCode}
                    </span>
                    {userLocation && load.distanceFromUser !== undefined && (
                      <span className="ml-2 text-gray-500 text-sm">
                        ({formatDistance(load.distanceFromUser)} away)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 text-red-600 mr-2" />
                    <span>
                      {load.destination.address && `${load.destination.address}, `}
                      {load.destination.city}, {load.destination.state} {load.destination.zipCode}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Pickup: {new Date(load.pickupDate).toLocaleDateString()}
                    {load.pickupTime && ` at ${load.pickupTime}`}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Delivery: {new Date(load.deliveryDate).toLocaleDateString()}
                    {load.deliveryTime && ` by ${load.deliveryTime}`}
                  </div>
                </div>
              </div>

              {/* Load Details */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Load Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span>{load.loadType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipment:</span>
                    <span>{load.equipmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span>{load.details.weight} lbs</span>
                  </div>
                  {load.details.pieces && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pieces:</span>
                      <span>{load.details.pieces}</span>
                    </div>
                  )}
                </div>
                {load.details.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {load.details.description.length > 100 
                      ? `${load.details.description.substring(0, 100)}...`
                      : load.details.description
                    }
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-between">
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleLoadSelect(load)} 
                    className="w-full"
                  >
                    View Details
                  </Button>
                  <Button variant="outline" className="w-full">
                    Contact Shipper
                  </Button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  Posted: {new Date(load.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredLoads.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loads found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new loads.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading available loads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Available Loads</h1>
          <p className="text-gray-600">Find loads that match your route and equipment</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4 mr-1" />
            Map
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={getUserLocation}
            disabled={!navigator.geolocation}
          >
            <Locate className="h-4 w-4 mr-1" />
            Update Location
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLoads}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">{locationError}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="City, state, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Distance */}
            {userLocation && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Distance ({maxDistance} mi)
                </label>
                <input
                  type="range"
                  min="25"
                  max="500"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Equipment Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Equipment</label>
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Equipment</SelectItem>
                  <SelectItem value="dry_van">Dry Van</SelectItem>
                  <SelectItem value="reefer">Reefer</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="step_deck">Step Deck</SelectItem>
                  <SelectItem value="lowboy">Lowboy</SelectItem>
                  <SelectItem value="tanker">Tanker</SelectItem>
                  <SelectItem value="box_truck">Box Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Load Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Load Type</label>
              <Select value={loadType} onValueChange={setLoadType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Type</SelectItem>
                  <SelectItem value="full_truckload">Full Truckload</SelectItem>
                  <SelectItem value="less_than_truckload">LTL</SelectItem>
                  <SelectItem value="partial_load">Partial</SelectItem>
                  <SelectItem value="expedited">Expedited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rate Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Min Rate</label>
              <Input
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(Number(e.target.value))}
                placeholder="$0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Rate</label>
              <Input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                placeholder="$10,000"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rate">Rate (High to Low)</SelectItem>
                  <SelectItem value="pickup_date">Pickup Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredLoads.length} of {loads.length} loads
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setEquipmentType('');
                setLoadType('');
                setMinRate(0);
                setMaxRate(10000);
                setMaxDistance(500);
                setSortBy('distance');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Load List or Map */}
      {viewMode === 'map' ? renderMapView() : renderListView()}
    </div>
  );
}