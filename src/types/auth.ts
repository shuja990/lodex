export type UserRole = 'admin' | 'shipper' | 'carrier' | 'driver';

// For carriers: fleet owners who manage multiple trucks/drivers
// For drivers: independent drivers who own/operate their own truck
export interface User {
  _id?: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  company?: string; // Required for shippers and carriers (fleet owners)
  phone?: string;
  
  // Truck/Vehicle information (for carriers and drivers)
  truckNumber?: string;
  truckType?: string; // e.g., "Flatbed", "Dry Van", "Refrigerated", "Box Truck"
  truckCapacity?: number; // in tons or cubic feet
  cdlNumber?: string; // Commercial Driver's License number
  dotNumber?: string; // Department of Transportation number
  mcNumber?: string; // Motor Carrier number (mainly for carriers/fleet owners)
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  
  // Truck/Vehicle information (for carriers and drivers)
  truckNumber?: string;
  truckType?: string;
  truckCapacity?: number;
  cdlNumber?: string;
  dotNumber?: string;
  mcNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    company?: string;
    truckNumber?: string;
    truckType?: string;
    truckCapacity?: number;
    cdlNumber?: string;
    dotNumber?: string;
    mcNumber?: string;
  };
  token?: string;
}

export interface UserSession {
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  company?: string;
  truckNumber?: string;
  truckType?: string;
  truckCapacity?: number;
  cdlNumber?: string;
  dotNumber?: string;
  mcNumber?: string;
}