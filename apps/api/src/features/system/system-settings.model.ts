import mongoose from 'mongoose';

export interface ISystemSettings extends mongoose.Document {
  key: string;
  value: any;
}

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
