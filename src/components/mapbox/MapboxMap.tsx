'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the access token
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
}

export interface MapboxMapProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  style?: string;
  className?: string;
  height?: string;
  width?: string;
  markers?: Array<{
    coordinates: [number, number];
    color?: string;
    popup?: string;
    id?: string;
  }>;
  route?: Array<[number, number]>; // Route coordinates
  onMapLoad?: (map: mapboxgl.Map) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  bounds?: [[number, number], [number, number]]; // [[west, south], [east, north]]
  fitBounds?: boolean;
  markerDraggable?: boolean;
  onMarkerDragEnd?: (payload: { id?: string; coordinates: [number, number] }) => void;
}

export default function MapboxMap({
  center = [-98.5795, 39.8283], // Center of US
  zoom = 4,
  style = 'mapbox://styles/mapbox/streets-v12',
  className = '',
  height = '400px',
  width = '100%',
  markers = [],
  route = [],
  onMapLoad,
  onMapClick,
  bounds,
  fitBounds = false,
  markerDraggable = false,
  onMarkerDragEnd
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // Track marker instances so we can remove them reliably between renders
  const markerInstancesRef = useRef<mapboxgl.Marker[]>([]);
  const prevMarkersSignatureRef = useRef<string>('');
  const prevRouteSignatureRef = useRef<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style,
        center,
        zoom
      });

    map.current.on('load', () => {
      console.log('Map loaded');
      setIsLoaded(true);
      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }
    });

    map.current.on('style.load', () => {
      console.log('Style loaded');
      setIsStyleLoaded(true);
      setError(null); // Clear any previous errors
    });

    map.current.on('styledata', () => {
      console.log('Style data loaded');
      // This fires when the style is loaded and ready
      if (map.current?.isStyleLoaded()) {
        setIsStyleLoaded(true);
      }
    });      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        setError(e.error.message || 'Map loading error');
      });

      map.current.on('click', (e) => {
        if (onMapClick) {
          onMapClick([e.lngLat.lng, e.lngLat.lat]);
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (mapError) {
      console.error('Failed to initialize map:', mapError);
      setError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [style, center, zoom, onMapLoad, onMapClick]);

  // Update markers - with timeout fallback
  useEffect(() => {
    console.log('Markers effect:', { 
      hasMap: !!map.current, 
      isLoaded, 
      isStyleLoaded,
      isMapStyleLoaded: map.current?.isStyleLoaded?.(),
      markersCount: markers.length 
    });
    
    // Function to add markers
    const addMarkers = () => {
      if (!map.current) return;
      
      try {
        console.log('Adding markers:', markers);
        // Skip if markers unchanged (by coordinates & count)
        const signature = JSON.stringify(markers.map(m => m.coordinates));
        if (signature === prevMarkersSignatureRef.current) {
          console.log('Markers unchanged; skipping update');
          return;
        }
        prevMarkersSignatureRef.current = signature;
        
        // Remove existing markers using Mapbox API for reliability
        if (markerInstancesRef.current.length) {
          markerInstancesRef.current.forEach((m) => {
            try { m.remove(); } catch {}
          });
          markerInstancesRef.current = [];
        }

        // Add new markers
        markers.forEach((marker, index) => {
          console.log(`Adding marker ${index}:`, marker);
          
          const el = document.createElement('div');
          el.className = 'mapbox-marker';
          el.style.backgroundColor = marker.color || '#3B82F6';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          const mapboxMarker = new mapboxgl.Marker({ element: el, draggable: markerDraggable })
            .setLngLat(marker.coordinates)
            .addTo(map.current!);

          if (marker.popup) {
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(marker.popup);
            mapboxMarker.setPopup(popup);
          }
          if (markerDraggable && onMarkerDragEnd) {
            mapboxMarker.on('dragend', () => {
              const lngLat = mapboxMarker.getLngLat();
              onMarkerDragEnd({ id: marker.id, coordinates: [lngLat.lng, lngLat.lat] });
            });
          }
          // Track instance for cleanup
          markerInstancesRef.current.push(mapboxMarker);
          
          console.log(`Marker ${index} added successfully`);
        });
      } catch (error) {
        console.error('Error adding markers:', error);
        setError('Failed to add markers to map');
      }
    };
    
    // Only require map to be loaded for DOM markers (no style needed)
    if (!map.current || !isLoaded) return;
    addMarkers();
  }, [markers, isLoaded, isStyleLoaded, markerDraggable, onMarkerDragEnd]);

  // Update route - with timeout fallback
  useEffect(() => {
    console.log('Route effect:', { 
      hasMap: !!map.current, 
      isLoaded, 
      isStyleLoaded,
      isMapStyleLoaded: map.current?.isStyleLoaded?.(),
      routeLength: route.length 
    });
    
    // Function to add or clear route
    const addRoute = () => {
      if (!map.current) return;
      
      try {
        console.log('Updating route:', route);
        const signature = JSON.stringify(route);
        if (signature === prevRouteSignatureRef.current) {
          console.log('Route unchanged; skipping update');
          return;
        }
        prevRouteSignatureRef.current = signature;
        
        // Remove existing route
        if (map.current!.getSource('route')) {
          console.log('Removing existing route');
          map.current!.removeLayer('route');
          map.current!.removeSource('route');
        }

        // Add new route
        if (route.length > 0) {
          console.log('Adding new route with', route.length, 'points');
          
          map.current!.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route
              }
            }
          });

          map.current!.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 4
            }
          });
          
          console.log('Route added successfully');
        } else {
          console.log('No route coordinates provided; cleared existing route if any');
        }
      } catch (error) {
        console.error('Error updating route:', error);
        setError('Failed to update route on map');
      }
    };
    
    if (!map.current || !isLoaded) return;
    
    const tryAdd = () => {
      if (map.current?.isStyleLoaded?.()) {
        addRoute();
        return true;
      }
      return false;
    };

    if (!tryAdd()) {
      console.log('Style not ready for route yet, waiting...');
      const onStyleLoad = () => {
        tryAdd();
      };
      map.current?.once('style.load', onStyleLoad);
      const timeout = setTimeout(() => {
        tryAdd();
      }, 800);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [route, isLoaded, isStyleLoaded]);

  // Fit bounds
  useEffect(() => {
    if (!map.current || !isLoaded || !isStyleLoaded || !bounds || !fitBounds) return;

    try {
      map.current!.fitBounds(bounds, {
        padding: 50
      });
    } catch (error) {
      console.error('Error fitting bounds:', error);
      setError('Failed to fit map bounds');
    }
  }, [bounds, fitBounds, isLoaded, isStyleLoaded]);

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Error display */}
      {error && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      
      {/* Loading indicator - only show if map is not loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-gray-600 text-sm">Loading map...</div>
        </div>
      )}
      
      <div
        ref={mapContainer}
        className="mapbox-map w-full h-full"
        style={{
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}