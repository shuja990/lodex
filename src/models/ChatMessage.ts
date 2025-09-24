import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessageDocument extends Document {
  loadId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>({
  loadId: { type: Schema.Types.ObjectId, ref: 'Load', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true });

ChatMessageSchema.index({ loadId: 1, createdAt: 1 });

interface ChatMessagePlain {
  _id: string;
  loadId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

ChatMessageSchema.methods.toJSON = function(): ChatMessagePlain {
  const obj = this.toObject() as Omit<ChatMessagePlain, '_id' | 'loadId' | 'senderId'> & { _id: mongoose.Types.ObjectId; loadId: mongoose.Types.ObjectId; senderId: mongoose.Types.ObjectId; };
  // message not declared in ChatMessagePlain intermediate mapping above, extract from original doc
  const message: string = (this as IChatMessageDocument).message;
  return {
    _id: obj._id.toString(),
    loadId: obj.loadId.toString(),
    senderId: obj.senderId.toString(),
    message,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model<IChatMessageDocument>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
