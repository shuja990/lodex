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
  timestamps: true
});

// Lightweight, explicit serializer (no mutation of mongoose internals)
type PrimitiveId = string | mongoose.Types.ObjectId;
type MaybePopulatedRef<T = unknown> = ({ _id?: PrimitiveId } & Partial<T>) | PrimitiveId;
interface RawOfferShape {
  _id: PrimitiveId;
  loadId?: MaybePopulatedRef;
  carrierId?: MaybePopulatedRef;
  amount: number;
  message?: string;
  status: OfferStatus;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export function serializeOffer(doc: IOfferDocument | RawOfferShape | null | undefined) {
  if (!doc) return null;
  const maybeDoc = doc as unknown as { toObject?: () => RawOfferShape } | RawOfferShape;
  const raw: RawOfferShape = typeof maybeDoc === 'object' && maybeDoc && 'toObject' in maybeDoc && typeof maybeDoc.toObject === 'function'
    ? maybeDoc.toObject()
    : (maybeDoc as RawOfferShape);

  const result: Record<string, unknown> = {
  _id: (raw._id as mongoose.Types.ObjectId)?.toString?.() || String(raw._id),
    loadId: raw.loadId,
    carrierId: raw.carrierId,
    amount: raw.amount,
    message: raw.message,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };

  // Normalize loadId
  if (raw.loadId && typeof raw.loadId === 'object' && raw.loadId._id) {
  const l = raw.loadId as Record<string, unknown> & { _id?: PrimitiveId };
    result.loadId = {
      _id: l._id?.toString?.() || String(l._id),
      loadNumber: l.loadNumber,
      origin: l.origin,
      destination: l.destination,
      equipmentType: l.equipmentType,
      distance: l.distance,
      rate: l.rate,
      pickupDate: l.pickupDate,
      status: l.status
    };
  } else if (raw.loadId) {
    result.loadId = raw.loadId?.toString?.() || String(raw.loadId);
  }

  // Normalize carrierId
  if (raw.carrierId && typeof raw.carrierId === 'object' && raw.carrierId._id) {
  const c = raw.carrierId as Record<string, unknown> & { _id?: PrimitiveId };
    result.carrierId = {
      _id: c._id?.toString?.() || String(c._id),
      companyName: c.companyName || c.company,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      mcNumber: c.mcNumber
    };
  } else if (raw.carrierId) {
    result.carrierId = raw.carrierId?.toString?.() || String(raw.carrierId);
  }

  return result;
}

OfferSchema.index({ loadId: 1, carrierId: 1 }, { unique: true });

const Offer = mongoose.models.Offer || mongoose.model<IOfferDocument>('Offer', OfferSchema);

export default Offer;
