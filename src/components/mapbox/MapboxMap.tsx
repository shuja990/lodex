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
  // Track style reloads to force marker refreshes when style changes
  const [styleVersion, setStyleVersion] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to ensure markers exist; re-adds when missing or signature changed
  const ensureMarkers = (force = false) => {
    if (!map.current) return;
    try {
      const signature = JSON.stringify({
        coords: markers.map((m) => m.coordinates),
        v: styleVersion,
      });
      const needReadd =
        force ||
        markerInstancesRef.current.length !== markers.length ||
        prevMarkersSignatureRef.current !== signature;
      if (!needReadd) return;

      // Remove existing
      if (markerInstancesRef.current.length) {
        markerInstancesRef.current.forEach((m) => {
          try {
            m.remove();
          } catch {}
        });
        markerInstancesRef.current = [];
      }

      // Add markers
      markers.forEach((marker) => {
        const el = document.createElement('div');
        el.className = 'mapbox-marker';
        el.style.backgroundColor = marker.color || '#3B82F6';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.zIndex = '10';

        const mapboxMarker = new mapboxgl.Marker({ element: el, draggable: markerDraggable })
          .setLngLat(marker.coordinates)
          .addTo(map.current!);

        if (marker.popup) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(marker.popup);
          mapboxMarker.setPopup(popup);
        }
        if (markerDraggable && onMarkerDragEnd) {
          mapboxMarker.on('dragend', () => {
            const lngLat = mapboxMarker.getLngLat();
            onMarkerDragEnd({ id: marker.id, coordinates: [lngLat.lng, lngLat.lat] });
          });
        }
        markerInstancesRef.current.push(mapboxMarker);
      });

      prevMarkersSignatureRef.current = signature;
    } catch (e) {
      console.error('ensureMarkers error:', e);
    }
  };

  // Stable ref to use inside event handlers without re-subscribing
  const ensureMarkersRef = useRef(ensureMarkers);
  useEffect(() => {
    ensureMarkersRef.current = ensureMarkers;
  }, [ensureMarkers]);

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
      // Increment style version so markers can be refreshed after style reloads
      setStyleVersion((v) => v + 1);
      // Reset marker signature to ensure re-add after style changes
      prevMarkersSignatureRef.current = '';
      setError(null); // Clear any previous errors
      // After style load, ensure markers exist
      ensureMarkersRef.current(true);
    });

    map.current.on('styledata', () => {
      console.log('Style data loaded');
      // This fires when the style is loaded and ready
      if (map.current?.isStyleLoaded()) {
        setIsStyleLoaded(true);
        // Increment style version so markers can be refreshed after style data updates
        setStyleVersion((v) => v + 1);
        // Reset marker signature to ensure re-add after style changes
        prevMarkersSignatureRef.current = '';
        // Ensure markers are present
        ensureMarkersRef.current(true);
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
        // Clear marker instances so they can be re-added on next mount
        markerInstancesRef.current = [];
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
        // Include style version in signature to force re-adding when style reloads
        const signature = JSON.stringify({
          coords: markers.map(m => m.coordinates),
          v: styleVersion,
        });
        if (signature === prevMarkersSignatureRef.current) {
          // If signature is the same but instances are missing, re-add them
          if (markerInstancesRef.current.length !== markers.length) {
            console.log('Marker instances missing; forcing re-add');
          } else {
            console.log('Markers unchanged; skipping update');
            return;
          }
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
  }, [markers, isLoaded, isStyleLoaded, markerDraggable, onMarkerDragEnd, styleVersion]);

  // Update route - robustly waits for map 'idle' to ensure style is fully ready
  useEffect(() => {
    const m = map.current;
    if (!m || !isLoaded) return;

    // Remove route if not enough points
    if (!route || route.length < 2) {
      if (m.getSource('route')) {
        try {
          m.removeLayer('route');
          m.removeSource('route');
        } catch {}
      }
      prevRouteSignatureRef.current = '';
      return;
    }

    // Validate coordinates
    const validRoute = route.filter((coord) =>
      Array.isArray(coord) &&
      coord.length === 2 &&
      typeof coord[0] === 'number' &&
      typeof coord[1] === 'number' &&
      coord[0] !== 0 && coord[1] !== 0 &&
      !isNaN(coord[0]) && !isNaN(coord[1])
    );
    if (validRoute.length < 2) return;

    const signature = JSON.stringify(validRoute);
    if (signature === prevRouteSignatureRef.current && m.getSource('route')) {
      // Nothing to do
      return;
    }

    let idleTimeout: ReturnType<typeof setTimeout> | undefined;
    let removed = false;

    const addRouteSafely = (): boolean => {
      if (!map.current) return false;
      if (!m.isStyleLoaded() || !m.loaded()) return false;
      try {
        // Remove existing if any (style may have reset)
        if (m.getSource('route')) {
          try { m.removeLayer('route'); } catch {}
          try { m.removeSource('route'); } catch {}
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: validRoute,
            },
          },
        } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3B82F6', 'line-width': 4, 'line-opacity': 0.8 },
        } as any);
        // After (re)adding the route, ensure markers are present above
        setTimeout(() => ensureMarkersRef.current(true), 0);
        prevRouteSignatureRef.current = signature;
        return true;
      } catch (e) {
        console.error('Error adding route safely:', e);
        return false;
      }
    };

    // Try immediately if map looks ready
    if (m.isStyleLoaded() && m.loaded()) {
      if (addRouteSafely()) return;
    }

    // Otherwise, wait for the truly idle state, then retry a few times
    let retries = 0;
    const maxRetries = 5;
    const onIdle = () => {
      if (removed) return;
      if (addRouteSafely()) return;
      if (retries < maxRetries) {
        retries++;
        idleTimeout = setTimeout(() => {
          if (!removed) m.once('idle', onIdle);
        }, 200 * retries);
      } else {
        console.warn('Failed to add route after retries');
      }
    };

    m.once('idle', onIdle);

    return () => {
      removed = true;
      try { m.off('idle', onIdle); } catch {}
      if (idleTimeout) clearTimeout(idleTimeout);
    };
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