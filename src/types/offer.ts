import { IUser } from './user';

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface IOffer {
  _id: string;
  loadId: string;
  carrierId: IUser;
  amount: number;
  message?: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt:string;
}
