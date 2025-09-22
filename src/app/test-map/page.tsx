'use client';

import React from 'react';
import MapboxMap from '@/components/mapbox/MapboxMap';

export default function TestMapPage() {
  // Test markers - hardcoded coordinates for New York and Los Angeles
  const testMarkers = [
    {
      coordinates: [-74.006, 40.7128] as [number, number],
      color: '#10B981',
      popup: 'New York',
      id: 'nyc'
    },
    {
      coordinates: [-118.2437, 34.0522] as [number, number], 
      color: '#EF4444',
      popup: 'Los Angeles',
      id: 'la'
    }
  ];

  // Test route - simplified line between NYC and LA
  const testRoute = [
    [-74.006, 40.7128],
    [-87.6298, 41.8781], // Chicago
    [-118.2437, 34.0522]
  ] as Array<[number, number]>;

  console.log('Test page - markers:', testMarkers);
  console.log('Test page - route:', testRoute);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Map Test Page</h1>
      
      <div className="border rounded-lg overflow-hidden">
        <MapboxMap
          markers={testMarkers}
          route={testRoute}
          center={[-95, 37]} // Center of US
          zoom={4}
          height="500px"
          fitBounds={true}
          bounds={[[-125, 25], [-65, 50]]} // US bounds
        />
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <p>Markers: {testMarkers.length}</p>
        <p>Route points: {testRoute.length}</p>
        <p>Center: [-95, 37]</p>
      </div>
    </div>
  );
}