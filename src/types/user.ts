export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'shipper' | 'carrier' | 'driver' | 'admin';
  companyName?: string;
  phone?: string;
  mcNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}