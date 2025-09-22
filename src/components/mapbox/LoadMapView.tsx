'use client';

import React, { useState, useEffect } from 'react';
import MapboxMap from './MapboxMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadLocation } from '@/types/load';
import { getRoute, calculateDistance, formatDistance, estimateDrivingTime, getBoundsForRadius } from '@/lib/geolocation';
import { MapPin, Route, Clock, Ruler } from 'lucide-react';

export interface LoadMapViewProps {
  origin: LoadLocation;
  destination: LoadLocation;
  showRoute?: boolean;
  showInfo?: boolean;
  height?: string;
  className?: string;
}

export default function LoadMapView({
  origin,
  destination,
  showRoute = true,
  showInfo = true,
  height = '400px',
  className = ''
}: LoadMapViewProps) {
  const [route, setRoute] = useState<Array<[number, number]>>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Calculate straight-line distance
  const straightLineDistance = calculateDistance(
    origin.coordinates.latitude,
    origin.coordinates.longitude,
    destination.coordinates.latitude,
    destination.coordinates.longitude
  );

  // Fetch route data
  useEffect(() => {
    if (!showRoute) return;

    const fetchRoute = async () => {
      setIsLoadingRoute(true);
      try {
        const routeData = await getRoute(origin.coordinates, destination.coordinates);
        if (routeData && routeData.routes && routeData.routes.length > 0) {
          const routeGeometry = routeData.routes[0].geometry.coordinates;
          setRoute(routeGeometry);
          setRouteDistance(routeData.routes[0].distance / 1609.34); // Convert meters to miles
          setRouteDuration(routeData.routes[0].duration / 60); // Convert seconds to minutes
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [origin, destination, showRoute]);

  // Prepare markers
  const markers = [
    {
      coordinates: [origin.coordinates.longitude, origin.coordinates.latitude] as [number, number],
      color: '#10B981', // Green for origin
      popup: `<div class="p-2">
        <strong>Pickup Location</strong><br/>
        ${origin.address}<br/>
        ${origin.city}, ${origin.state} ${origin.zipCode}
      </div>`,
      id: 'origin'
    },
    {
      coordinates: [destination.coordinates.longitude, destination.coordinates.latitude] as [number, number],
      color: '#EF4444', // Red for destination
      popup: `<div class="p-2">
        <strong>Delivery Location</strong><br/>
        ${destination.address}<br/>
        ${destination.city}, ${destination.state} ${destination.zipCode}
      </div>`,
      id: 'destination'
    }
  ];

  console.log('LoadMapView markers:', markers);
  console.log('LoadMapView route:', route);
  console.log('LoadMapView origin:', origin);
  console.log('LoadMapView destination:', destination);

  // Calculate bounds to fit both points
  const bounds = getBoundsForRadius(
    (origin.coordinates.latitude + destination.coordinates.latitude) / 2,
    (origin.coordinates.longitude + destination.coordinates.longitude) / 2,
    Math.max(straightLineDistance * 0.6, 10) // Add some padding
  );

  return (
    <div className={className}>
      <MapboxMap
        markers={markers}
        route={showRoute ? route : []}
        bounds={bounds}
        fitBounds={true}
        height={height}
        className="rounded-lg border"
      />

      {showInfo && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <MapPin className="h-4 w-4 text-green-600 mr-2" />
                Pickup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm font-medium">{origin.city}, {origin.state}</p>
                <p className="text-xs text-gray-500">{origin.address}</p>
                <Badge variant="outline" className="text-xs">
                  {origin.coordinates.latitude.toFixed(4)}, {origin.coordinates.longitude.toFixed(4)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Destination Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <MapPin className="h-4 w-4 text-red-600 mr-2" />
                Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm font-medium">{destination.city}, {destination.state}</p>
                <p className="text-xs text-gray-500">{destination.address}</p>
                <Badge variant="outline" className="text-xs">
                  {destination.coordinates.latitude.toFixed(4)}, {destination.coordinates.longitude.toFixed(4)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Distance Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Ruler className="h-4 w-4 text-blue-600 mr-2" />
                Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {showRoute && route.length > 0 ? (
                  <>
                    <p className="text-sm font-medium">
                      {formatDistance(routeDistance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Driving distance
                    </p>
                    {isLoadingRoute && (
                      <Badge variant="outline" className="text-xs">
                        Loading...
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      {formatDistance(straightLineDistance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Straight line
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Duration Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Clock className="h-4 w-4 text-purple-600 mr-2" />
                {showRoute && route.length > 0 ? 'Drive Time' : 'Est. Time'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {showRoute && route.length > 0 && routeDuration > 0 ? (
                  <>
                    <p className="text-sm font-medium">
                      {Math.floor(routeDuration / 60)}h {Math.round(routeDuration % 60)}m
                    </p>
                    <p className="text-xs text-gray-500">
                      Estimated driving
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      {estimateDrivingTime(straightLineDistance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Estimated
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showRoute && route.length > 0 && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Pickup Location</span>
            </div>
            <Route className="h-4 w-4" />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Delivery Location</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}