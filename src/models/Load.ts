import mongoose, { Document, Schema } from 'mongoose';
import { LoadStatus, LoadType, EquipmentType, LoadLocation, LoadDetails } from '@/types/load';

export interface ILoadDocument extends Document {
  shipperId: mongoose.Types.ObjectId;
  carrierId?: mongoose.Types.ObjectId;
  
  loadNumber?: string;
  referenceNumber?: string;
  
  origin: LoadLocation;
  destination: LoadLocation;
  distance?: number;
  
  loadType: LoadType;
  equipmentType: EquipmentType;
  details: LoadDetails;
  
  pickupDate: Date;
  deliveryDate: Date;
  pickupTime?: string;
  deliveryTime?: string;
  
  rate: number;
  ratePerMile?: number;
  currency: string;
  
  status: LoadStatus;
  postedAt: Date;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  
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
  
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}, { _id: false });

const LoadLocationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  location: {
    type: PointSchema,
    required: true
  }
}, { _id: false });

const LoadDetailsSchema = new Schema({
  weight: { type: Number, required: true, min: 1 },
  length: { type: Number, min: 0 },
  width: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  pieces: { type: Number },
  description: { type: String, required: true, trim: true },
  specialInstructions: { type: String, trim: true },
  hazmat: { type: Boolean, default: false },
  temperatureControlled: { type: Boolean, default: false },
  temperatureRange: {
    min: { type: Number },
    max: { type: Number }
  }
}, { _id: false });

const ContactPersonSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true }
}, { _id: false });

const LoadSchema = new Schema<ILoadDocument>({
  shipperId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  carrierId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  loadNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  referenceNumber: {
    type: String,
    trim: true,
    index: true
  },
  
  origin: {
    type: LoadLocationSchema,
    required: true
  },
  destination: {
    type: LoadLocationSchema,
    required: true
  },
  distance: {
    type: Number,
    min: 0
  },
  
  loadType: {
    type: String,
    required: true,
    enum: ['Full Truckload', 'Less Than Truckload', 'Partial Load', 'Expedited', 'Temperature Controlled']
  },
  equipmentType: {
    type: String,
    required: true,
    enum: ['Dry Van', 'Flatbed', 'Refrigerated', 'Box Truck', 'Step Deck', 'Lowboy', 'Tanker', 'Other']
  },
  details: {
    type: LoadDetailsSchema,
    required: true
  },
  
  pickupDate: {
    type: Date,
    required: true,
    index: true
  },
  deliveryDate: {
    type: Date,
    required: true,
    index: true
  },
  pickupTime: {
    type: String,
    trim: true
  },
  deliveryTime: {
    type: String,
    trim: true
  },
  
  rate: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  ratePerMile: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  
  status: {
    type: String,
    required: true,
    enum: ['posted', 'assigned', 'in_transit', 'delivered', 'cancelled'],
    default: 'posted',
    index: true
  },
  postedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  assignedAt: {
    type: Date,
    index: true
  },
  pickedUpAt: {
    type: Date,
    index: true
  },
  deliveredAt: {
    type: Date,
    index: true
  },
  
  contactInfo: {
    pickup: {
      type: ContactPersonSchema,
      required: true
    },
    delivery: {
      type: ContactPersonSchema,
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
LoadSchema.index({ 'origin.coordinates.latitude': 1, 'origin.coordinates.longitude': 1 });
LoadSchema.index({ 'destination.coordinates.latitude': 1, 'destination.coordinates.longitude': 1 });
LoadSchema.index({ equipmentType: 1, status: 1 });
LoadSchema.index({ loadType: 1, status: 1 });
LoadSchema.index({ pickupDate: 1, status: 1 });
LoadSchema.index({ deliveryDate: 1, status: 1 });
LoadSchema.index({ postedAt: -1 });

// Compound indexes for common queries
LoadSchema.index({ 
  shipperId: 1, 
  status: 1, 
  postedAt: -1 
});

LoadSchema.index({ 
  status: 1, 
  equipmentType: 1, 
  pickupDate: 1 
});

// Pre-save middleware to generate load number and calculate rate per mile
LoadSchema.pre('save', async function(next) {
  // Generate load number if it's a new document
  if (this.isNew && !this.loadNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.loadNumber = `LD${timestamp.slice(-6)}${random}`;
  }
  
  // Calculate rate per mile if distance is available
  if (this.distance && this.distance > 0) {
    this.ratePerMile = this.rate / this.distance;
  }
  
  next();
});

// Instance methods
LoadSchema.methods.toJSON = function() {
  const load = this.toObject();
  load._id = load._id.toString();
  load.shipperId = load.shipperId.toString();
  if (load.carrierId) {
    load.carrierId = load.carrierId.toString();
  }
  return load;
};

// Static methods
LoadSchema.statics.findByShipper = function(shipperId: string) {
  return this.find({ shipperId }).sort({ postedAt: -1 });
};

LoadSchema.statics.findByCarrier = function(carrierId: string) {
  return this.find({ carrierId }).sort({ assignedAt: -1 });
};

LoadSchema.statics.findAvailable = function(filters = {}) {
  return this.find({ 
    status: 'posted',
    pickupDate: { $gte: new Date() },
    ...filters 
  }).sort({ postedAt: -1 });
};

LoadSchema.statics.findNearLocation = function(longitude: number, latitude: number, maxDistance: number = 50) {
  // maxDistance in miles, convert to meters for MongoDB
  const maxDistanceMeters = maxDistance * 1609.34;
  
  return this.find({
    status: 'posted',
    $or: [
      {
        'origin.coordinates': {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], maxDistanceMeters / 6378100]
          }
        }
      },
      {
        'destination.coordinates': {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], maxDistanceMeters / 6378100]
          }
        }
      }
    ]
  }).sort({ postedAt: -1 });
};

// Create 2dsphere indexes for geospatial queries
LoadSchema.index({ 'origin.location': '2dsphere', 'destination.location': '2dsphere' });

// Export the model
export const Load = mongoose.models.Load || mongoose.model<ILoadDocument>('Load', LoadSchema);

export default Load;