import { Schema, model, Document } from 'mongoose';
import { GlobalBrandInput } from '@repo/shared';

// Brand Interface
export interface IGlobalBrand extends Omit<GlobalBrandInput, 'variants'>, Document {
    variants: Array<{
        size: string;
        regulator: string;
        cylinderImage?: string;
        image?: string;
    }>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const GlobalBrandSchema = new Schema<IGlobalBrand>({
    name: { type: String, required: true, unique: true },
    logo: { type: String },
    color20mm: { type: String, required: true },
    color22mm: { type: String, required: true },
    variants: [{
        size: { type: String, required: true },
        regulator: { type: String, required: true },
        cylinderImage: { type: String },
        image: { type: String }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const GlobalBrand = model<IGlobalBrand>('GlobalBrand', GlobalBrandSchema);
