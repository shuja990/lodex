import { LoadLocation, MapboxFeature, RouteResponse } from '@/types/load';

/**
 * Calculate the great-circle distance between two points on Earth
 * Uses the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  return calculateDistance(lat1, lon1, lat2, lon2) * 1.609344;
}

/**
 * Convert coordinates to readable location string
 */
export function formatLocation(location: LoadLocation): string {
  return `${location.city}, ${location.state} ${location.zipCode}`;
}

/**
 * Get user's current location using the Geolocation API
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Get approximate location from IP (fallback for when GPS is not available)
 */
export async function getLocationFromIP(): Promise<{ latitude: number; longitude: number; city: string; state: string; } | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to get location from IP');
    }
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || 'Unknown',
        state: data.region || 'Unknown'
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return null;
  }
}

/**
 * Check if a point is within a certain radius of another point
 */
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radiusMiles: number
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusMiles;
}

/**
 * Get the bounds (bounding box) for a given center point and radius
 * Returns coordinates that can be used for map fitting
 */
export function getBoundsForRadius(
  centerLat: number,
  centerLon: number,
  radiusMiles: number
): [[number, number], [number, number]] {
  // Approximate degree change per mile
  const latChange = radiusMiles / 69; // 1 degree of latitude ≈ 69 miles
  const lonChange = radiusMiles / (69 * Math.cos(centerLat * Math.PI / 180));

  const north = centerLat + latChange;
  const south = centerLat - latChange;
  const east = centerLon + lonChange;
  const west = centerLon - lonChange;

  return [[west, south], [east, north]]; // [southWest, northEast]
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 1) {
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  } else if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  } else {
    return `${Math.round(miles)} mi`;
  }
}

/**
 * Calculate estimated driving time based on distance
 * Assumes average highway speed of 60 mph
 */
export function estimateDrivingTime(miles: number): string {
  const hours = miles / 60; // Assuming 60 mph average
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  }
}

/**
 * Parse Mapbox geocoding response to LoadLocation
 */
export function mapboxFeatureToLocation(feature: MapboxFeature): LoadLocation | null {
  try {
    const [longitude, latitude] = feature.geometry.coordinates;
    
    // Extract address components from context
    let city = '';
    let state = '';
    let zipCode = '';
    
    // Look for place (city) in context
    const placeContext = feature.context?.find(ctx => ctx.id.startsWith('place'));
    if (placeContext) {
      city = placeContext.text;
    }
    
    // Look for region (state) in context
    const regionContext = feature.context?.find(ctx => ctx.id.startsWith('region'));
    if (regionContext) {
      state = regionContext.short_code || regionContext.text;
    }
    
    // Look for postcode in context
    const postcodeContext = feature.context?.find(ctx => ctx.id.startsWith('postcode'));
    if (postcodeContext) {
      zipCode = postcodeContext.text;
    }
    
    // Fallback: try to parse from place_name
    if (!city || !state) {
      const parts = feature.place_name.split(', ');
      if (parts.length >= 3) {
        if (!city) city = parts[1];
        if (!state) {
          const stateZip = parts[2].split(' ');
          state = stateZip[0];
          if (!zipCode && stateZip[1]) zipCode = stateZip[1];
        }
      }
    }
    
    return {
      address: feature.properties.address || feature.place_name,
      city: city || 'Unknown',
      state: state || 'Unknown',
      zipCode: zipCode || '',
      coordinates: {
        latitude,
        longitude
      }
    };
  } catch (error) {
    console.error('Error parsing Mapbox feature:', error);
    return null;
  }
}

/**
 * Geocode address using Mapbox Geocoding API
 */
export async function geocodeAddress(address: string): Promise<LoadLocation | null> {
  try {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Mapbox access token not configured');
    }
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&country=US&types=address,poi`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return mapboxFeatureToLocation(data.features[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Get driving route between two points using Mapbox Directions API
 */
export async function getRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<RouteResponse | null> {
  try {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Mapbox access token not configured');
    }
    
    const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${accessToken}&geometries=geojson&overview=full`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Route request failed');
    }
    
    const data: RouteResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
}

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get a user-friendly error message for geolocation errors
 */
export function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access denied. Please enable location permissions and try again.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please try again later.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
}