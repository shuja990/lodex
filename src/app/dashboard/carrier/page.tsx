'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Search, Clock, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import CarrierLoadsList from '@/components/loads/CarrierLoadsList';
import { LoadMapView } from '@/components/mapbox';
import { Load } from '@/types/load';

type ViewMode = 'dashboard' | 'browse-loads' | 'view-load';

interface LoadWithDistance extends Load {
  distanceFromUser?: number;
}

export default function CarrierDashboard() {
  const { user, logout } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedLoad, setSelectedLoad] = useState<LoadWithDistance | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleViewLoad = (load: LoadWithDistance) => {
    setSelectedLoad(load);
    setViewMode('view-load');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (viewMode === 'browse-loads') {
    return (
      <div className="container mx-auto px-4 py-8">
        <CarrierLoadsList onViewLoad={handleViewLoad} />
      </div>
    );
  }

  if (viewMode === 'view-load' && selectedLoad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Load Details</h1>
              <p className="text-gray-600">Load #{selectedLoad.loadNumber}</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setViewMode('browse-loads');
                  setSelectedLoad(null);
                }}
              >
                Back to Loads
              </Button>
              <Button>
                Contact Shipper
              </Button>
              <Button variant="outline">
                Save Load
              </Button>
            </div>
          </div>

          <LoadMapView
            origin={selectedLoad.origin}
            destination={selectedLoad.destination}
            showRoute={true}
            showInfo={true}
            height="500px"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Load Information */}
            <Card>
              <CardHeader>
                <CardTitle>Load Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Load Type:</span>
                  <span>{selectedLoad.loadType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Equipment:</span>
                  <span>{selectedLoad.equipmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Weight:</span>
                  <span>{selectedLoad.details.weight} lbs</span>
                </div>
                {selectedLoad.details.pieces && (
                  <div className="flex justify-between">
                    <span className="font-medium">Pieces:</span>
                    <span>{selectedLoad.details.pieces}</span>
                  </div>
                )}
                <div className="pt-2">
                  <span className="font-medium">Description:</span>
                  <p className="text-sm text-gray-600 mt-1">{selectedLoad.details.description}</p>
                </div>
                {selectedLoad.distanceFromUser && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Distance from you:</span>
                    <span className="text-blue-600 font-medium">
                      {Math.round(selectedLoad.distanceFromUser)} miles
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule & Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Pickup Date:</span>
                  <p className="text-sm">{new Date(selectedLoad.pickupDate).toLocaleDateString()}</p>
                  {selectedLoad.pickupTime && (
                    <p className="text-xs text-gray-600">{selectedLoad.pickupTime}</p>
                  )}
                </div>
                <div>
                  <span className="font-medium">Delivery Date:</span>
                  <p className="text-sm">{new Date(selectedLoad.deliveryDate).toLocaleDateString()}</p>
                  {selectedLoad.deliveryTime && (
                    <p className="text-xs text-gray-600">{selectedLoad.deliveryTime}</p>
                  )}
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total Rate:</span>
                  <span className="text-green-600 font-bold text-lg">
                    ${selectedLoad.rate.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Posted: {new Date(selectedLoad.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600">Pickup Contact</h4>
                  <p className="text-sm">{selectedLoad.contactInfo.pickup.name}</p>
                  <p className="text-sm text-gray-600">{selectedLoad.contactInfo.pickup.phone}</p>
                  {selectedLoad.contactInfo.pickup.email && (
                    <p className="text-sm text-gray-600">{selectedLoad.contactInfo.pickup.email}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-red-600">Delivery Contact</h4>
                  <p className="text-sm">{selectedLoad.contactInfo.delivery.name}</p>
                  <p className="text-sm text-gray-600">{selectedLoad.contactInfo.delivery.phone}</p>
                  {selectedLoad.contactInfo.delivery.email && (
                    <p className="text-sm text-gray-600">{selectedLoad.contactInfo.delivery.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {user.role === 'carrier' ? 'Carrier' : 'Driver'} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName} {user.lastName}
            {user.company && ` from ${user.company}`}
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Loads</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              In your area
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate/Mile</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.68</div>
            <p className="text-xs text-muted-foreground">
              +$0.15 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Loads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setViewMode('browse-loads')} 
              className="w-full justify-start"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Available Loads
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              Loads Near Me
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Saved Searches
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Loads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">LD789123 - In Transit</p>
                  <p className="text-xs text-gray-500">Chicago, IL → Atlanta, GA</p>
                </div>
                <span className="text-sm font-medium text-green-600">$2,800</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">LD789124 - Assigned</p>
                  <p className="text-xs text-gray-500">Dallas, TX → Phoenix, AZ</p>
                </div>
                <span className="text-sm font-medium text-green-600">$1,950</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">LD789125 - Pickup Today</p>
                  <p className="text-xs text-gray-500">Denver, CO → Salt Lake City, UT</p>
                </div>
                <span className="text-sm font-medium text-green-600">$1,200</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}