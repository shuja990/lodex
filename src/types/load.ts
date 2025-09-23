export type LoadStatus = 'posted' | 'assigned' | 'in_transit' | 'delivered_pending' | 'delivered' | 'cancelled';
export type LoadType = 'Full Truckload' | 'Less Than Truckload' | 'Partial Load' | 'Expedited' | 'Temperature Controlled';
export type EquipmentType = 'Dry Van' | 'Flatbed' | 'Refrigerated' | 'Box Truck' | 'Step Deck' | 'Lowboy' | 'Tanker' | 'Other';

export interface LoadLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface LoadDetails {
  weight: number; // in pounds
  length?: number; // in feet
  width?: number; // in feet
  height?: number; // in feet
  pieces?: number; // number of pieces
  description: string;
  specialInstructions?: string;
  hazmat?: boolean;
  temperatureControlled?: boolean;
  temperatureRange?: {
    min: number;
    max: number;
  };
}

export interface Load {
  _id?: string;
  shipperId: string;
  carrierId?: string; // assigned carrier
  
  // Load identification
  loadNumber: string; // auto-generated unique identifier
  referenceNumber?: string; // customer reference
  
  // Location information
  origin: LoadLocation;
  destination: LoadLocation;
  distance?: number; // calculated distance in miles
  
  // Load details
  loadType: LoadType;
  equipmentType: EquipmentType;
  details: LoadDetails;
  
  // Scheduling
  pickupDate: Date;
  deliveryDate: Date;
  pickupTime?: string; // e.g., "09:00 AM - 11:00 AM"
  deliveryTime?: string;
  
  // Pricing
  rate: number; // total rate for the load
  ratePerMile?: number; // calculated rate per mile
  currency: string; // default 'USD'
  
  // Status and tracking
  status: LoadStatus;
  postedAt: Date;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  
  // Additional information
  contactInfo: {
    pickup: {
      name: string;
      phone: string;
      email?: string;
    };
    delivery: {
      name: string;
      phone: string;
      email?: string;
    };
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLoadRequest {
  // Location information
  origin: LoadLocation;
  destination: LoadLocation;
  
  // Load details
  loadType: LoadType;
  equipmentType: EquipmentType;
  details: LoadDetails;
  
  // Scheduling
  pickupDate: string; // ISO date string
  deliveryDate: string; // ISO date string
  pickupTime?: string;
  deliveryTime?: string;
  
  // Pricing
  rate: number;
  
  // Contact information
  contactInfo: {
    pickup: {
      name: string;
      phone: string;
      email?: string;
    };
    delivery: {
      name: string;
      phone: string;
      email?: string;
    };
  };
  
  // Optional fields
  referenceNumber?: string;
}

export interface UpdateLoadRequest extends Partial<CreateLoadRequest> {
  status?: LoadStatus;
}

export interface LoadSearchFilters {
  origin?: {
    latitude: number;
    longitude: number;
    radius: number; // search radius in miles
  };
  destination?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  equipmentType?: EquipmentType;
  loadType?: LoadType;
  pickupDateFrom?: string;
  pickupDateTo?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  minRate?: number;
  maxRate?: number;
  maxDistance?: number;
  hazmat?: boolean;
  temperatureControlled?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'pickupDate' | 'deliveryDate' | 'rate' | 'distance' | 'postedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface LoadResponse {
  success: boolean;
  message: string;
  load?: Load;
  loads?: Load[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MapboxFeature {
  id: string;
  type: 'Feature';
  place_name: string;
  properties: {
    address?: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  context: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export interface RouteResponse {
  routes: Array<{
    distance: number; // in meters
    duration: number; // in seconds
    geometry: {
      coordinates: Array<[number, number]>; // [longitude, latitude]
    };
  }>;
}