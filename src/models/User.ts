import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types/auth';

export interface IUser extends Document {
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
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'shipper', 'carrier', 'driver'],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
    // Required for shippers and carriers (fleet owners)
    required: function() {
      return this.role === 'shipper' || this.role === 'carrier';
    },
  },
  phone: {
    type: String,
    trim: true,
    // Required for carriers and drivers
    required: function() {
      return this.role === 'carrier' || this.role === 'driver';
    },
  },
  
  // Truck/Vehicle information
  truckNumber: {
    type: String,
    trim: true,
    // Required for drivers
    required: function() {
      return this.role === 'driver';
    },
  },
  truckType: {
    type: String,
    enum: ['Flatbed', 'Dry Van', 'Refrigerated', 'Box Truck', 'Step Deck', 'Lowboy', 'Tanker', 'Other'],
    // Required for drivers
    required: function() {
      return this.role === 'driver';
    },
  },
  truckCapacity: {
    type: Number,
    min: 1,
    max: 80,
  },
  cdlNumber: {
    type: String,
    trim: true,
    // Required for drivers
    required: function() {
      return this.role === 'driver';
    },
  },
  dotNumber: {
    type: String,
    trim: true,
    // Required for carriers and drivers
    required: function() {
      return this.role === 'carrier' || this.role === 'driver';
    },
  },
  mcNumber: {
    type: String,
    trim: true,
    // Required for carriers (fleet owners)
    required: function() {
      return this.role === 'carrier';
    },
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role });
};

UserSchema.statics.createAdmin = async function(email: string, password: string, firstName: string, lastName: string) {
  return this.create({
    email,
    password,
    role: 'admin',
    firstName,
    lastName,
    isActive: true,
  });
};

// Export the model
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;