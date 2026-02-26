import { Schema, model, Document } from 'mongoose';

/**
 * GlobalBrand — cylinder brands only.
 * Stoves and regulators use free-text brand names per inventory entry.
 * Images for stoves/regulators come from GlobalProduct.
 */
export interface IGlobalBrand extends Document {
    name: string;
    logo: string;
    cylinderImage: string;
    color: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const GlobalBrandSchema = new Schema<IGlobalBrand>({
    name: { type: String, required: true, unique: true },
    logo: { type: String, required: true },
    cylinderImage: { type: String, required: true },
    color: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const GlobalBrand = model<IGlobalBrand>('GlobalBrand', GlobalBrandSchema);
