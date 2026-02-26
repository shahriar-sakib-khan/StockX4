import { Schema, model, Document } from 'mongoose';

// Global Brand Interface (Master Data)
export interface IGlobalBrand extends Document {
    name: string;
    logo: string;
    cylinderImage: string;
    color: string; // Standard color for this brand's cylinders
    type: 'cylinder' | 'stove' | 'regulator'; // Categorization
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const GlobalBrandSchema = new Schema<IGlobalBrand>({
    name: { type: String, required: true, unique: true },
    logo: { type: String, required: true },
    cylinderImage: { type: String, required: true },
    color: { type: String, required: true },
    type: {
        type: String,
        enum: ['cylinder', 'stove', 'regulator'],
        default: 'cylinder',
        required: true
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const GlobalBrand = model<IGlobalBrand>('GlobalBrand', GlobalBrandSchema);
