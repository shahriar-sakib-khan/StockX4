import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Auto-delete after 7 days
});

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
