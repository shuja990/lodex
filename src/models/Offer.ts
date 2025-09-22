import mongoose, { Document, Schema } from 'mongoose';

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface IOffer {
  loadId: mongoose.Types.ObjectId;
  carrierId: mongoose.Types.ObjectId;
  amount: number;
  message?: string;
  status: OfferStatus;
}

export interface IOfferDocument extends IOffer, Document {
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOfferDocument>({
  loadId: {
    type: Schema.Types.ObjectId,
    ref: 'Load',
    required: true,
    index: true,
  },
  carrierId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: true,
});

// Prevent a carrier from making multiple offers on the same load
OfferSchema.index({ loadId: 1, carrierId: 1 }, { unique: true });

export const Offer = mongoose.models.Offer || mongoose.model<IOfferDocument>('Offer', OfferSchema);

export default Offer;
