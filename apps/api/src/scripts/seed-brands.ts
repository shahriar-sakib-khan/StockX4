import mongoose from 'mongoose';
import { GlobalBrand } from '../features/brand/brand.model';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createPlaceholder = (width: number, height: number, color: string, text: string) => {
    // Remove # from color for URL
    const cleanColor = color.replace('#', '');
    return `https://placehold.co/${width}x${height}/${cleanColor}/FFFFFF?text=${encodeURIComponent(text)}`;
};

const brands = [
    {
        name: 'Bashundhara LPG',
        // color: Red
        logo: createPlaceholder(200, 100, '#FF0000', 'Bashundhara'),
        color20mm: '#FF0000',
        color22mm: '#8B0000',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#FF0000', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#8B0000', '12kg 22mm') },
            { size: '35kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 400, '#FF0000', '35kg 20mm') },
            { size: '35kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 400, '#8B0000', '35kg 22mm') },
            { size: '45kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 450, '#FF0000', '45kg 20mm') },
            { size: '45kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 450, '#8B0000', '45kg 22mm') },
        ]
    },
    {
        name: 'Omera LPG',
        // color: Yellow/Orange
        logo: createPlaceholder(200, 100, '#FFD700', 'Omera'),
        color20mm: '#FFD700',
        color22mm: '#FFA500',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#FFD700', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#FFA500', '12kg 22mm') },
            { size: '35kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 400, '#FFD700', '35kg 20mm') },
            { size: '35kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 400, '#FFA500', '35kg 22mm') },
        ]
    },
    {
        name: 'Jamuna LPG',
        logo: createPlaceholder(200, 100, '#DAA520', 'Jamuna'),
        color20mm: '#DAA520',
        color22mm: '#B8860B',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#DAA520', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#B8860B', '12kg 22mm') },
        ]
    },
    {
        name: 'Beximco LPG',
        logo: createPlaceholder(200, 100, '#008000', 'Beximco'),
        color20mm: '#008000',
        color22mm: '#006400',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#008000', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#006400', '12kg 22mm') },
        ]
    },
    {
        name: 'TotalGas',
        logo: createPlaceholder(200, 100, '#FF4500', 'Total'),
        color20mm: '#FF4500',
        color22mm: '#CD5C5C',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#FF4500', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#CD5C5C', '12kg 22mm') },
        ]
    },
    {
        name: 'G-Gas',
        logo: createPlaceholder(200, 100, '#808080', 'G-Gas'),
        color20mm: '#808080',
        color22mm: '#696969',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#808080', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#696969', '12kg 22mm') },
        ]
    },
    {
        name: 'Petromax LPG',
        logo: createPlaceholder(200, 100, '#0000FF', 'Petromax'),
        color20mm: '#0000FF',
        color22mm: '#00008B',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#0000FF', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#00008B', '12kg 22mm') },
        ]
    },
    {
        name: 'BM Energy',
        logo: createPlaceholder(200, 100, '#8B4513', 'BM Energy'),
        color20mm: '#8B4513',
        color22mm: '#A0522D',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#8B4513', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#A0522D', '12kg 22mm') },
        ]
    },
    {
        name: 'Navana LPG',
        logo: createPlaceholder(200, 100, '#FF69B4', 'Navana'),
        color20mm: '#FF69B4',
        color22mm: '#C71585',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#FF69B4', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#C71585', '12kg 22mm') },
        ]
    },
    {
        name: 'JMI LPG',
        logo: createPlaceholder(200, 100, '#800080', 'JMI'),
        color20mm: '#800080',
        color22mm: '#4B0082',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#800080', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: createPlaceholder(150, 300, '#4B0082', '12kg 22mm') },
        ]
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockx');
        console.log('Connected to DB');

        for (const brandData of brands) {
            const exists = await GlobalBrand.findOne({ name: brandData.name });
            if (!exists) {
                await GlobalBrand.create(brandData);
                console.log(`Created: ${brandData.name}`);
            } else {
                // Determine if we need to update existing ones.
                // Since user changed schema (removed price, adding images), explicit update is cleaner.
                // But generally users might drop DB.
                // Let's stick to "Skipped" for safety, but user instructed to use this script.
                // I will update them if they exist to apply the new schema.
                await GlobalBrand.updateOne({ name: brandData.name }, { $set: brandData });
                 // Unset price if it exists
                await GlobalBrand.updateOne({ name: brandData.name }, { $unset: { "variants.$[].price": "" } });
                console.log(`Updated: ${brandData.name}`);
            }
        }

        console.log('Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seed();
