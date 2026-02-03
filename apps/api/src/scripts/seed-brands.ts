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

// Cloudinary Brand Assets (Auto-generated from migration)
const BRAND_ASSETS: Record<string, string> = {
  "Aygaz LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557198/stockx/brands/aygaz/aygaz-22-12.png",
  "Bashundhara LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557199/stockx/brands/bashundhara/bashundhara-22-12.png",
  "Beximco LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557200/stockx/brands/beximco/beximco-22-12.png",
  "Bin Habeeb LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557202/stockx/brands/bin_habeeb/binhabib-22-12.png",
  "BM Energy": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557203/stockx/brands/bm_energy/bm-22-12.png",
  "Delta LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557204/stockx/brands/delta/delta-22-12.png",
  "Euro Gas": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557205/stockx/brands/euro/euro-22-12.png",
  "Fresh LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557206/stockx/brands/fresh/fresh-22-12.png",
  "G-Gas": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557207/stockx/brands/g_gas/ggas-22-12.png",
  "Index LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557208/stockx/brands/index/index-22-12.png",
  "Jamuna LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557209/stockx/brands/jamuna/jamuna-22-12.png",
  "JMI LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557211/stockx/brands/jmi/jmi-22-12.png",
  "Laugfs Gas": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557212/stockx/brands/laugfs/laugfs-22-12.png",
  "Navana LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557213/stockx/brands/navana/navana-22-12.png",
  "Omera LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557215/stockx/brands/omera/omera-22-12.png",
  "Orion Gas": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557216/stockx/brands/orion/orion-22-12.png",
  "Petromax LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557218/stockx/brands/petromax/petromax-22-12.png",
  "Promita LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557219/stockx/brands/promita/promita-22-12.png",
  "Sena LPG": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557220/stockx/brands/sena/shena-22-12.png",
  "TotalGas": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557222/stockx/brands/total/total-22-12.png",
  "Unigas": "https://res.cloudinary.com/dgmcwmwof/image/upload/v1770557223/stockx/brands/unigas/unigas-22-12.png"
};

const brands = [
    {
        name: 'Bashundhara LPG',
        logo: createPlaceholder(200, 100, '#FF0000', 'Bashundhara'),
        color20mm: '#FF0000',
        color22mm: '#8B0000',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: BRAND_ASSETS['Bashundhara LPG'] },
            { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Bashundhara LPG'] },
             // Add larger sizes using same image for now
            { size: '35kg', regulator: '20mm', cylinderImage: BRAND_ASSETS['Bashundhara LPG'] },
            { size: '35kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Bashundhara LPG'] },
            { size: '45kg', regulator: '20mm', cylinderImage: BRAND_ASSETS['Bashundhara LPG'] },
            { size: '45kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Bashundhara LPG'] },
        ]
    },
    {
        name: 'Omera LPG',
        logo: createPlaceholder(200, 100, '#FFD700', 'Omera'),
        color20mm: '#FFD700',
        color22mm: '#FFA500',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: BRAND_ASSETS['Omera LPG'] },
            { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Omera LPG'] },
            { size: '35kg', regulator: '20mm', cylinderImage: BRAND_ASSETS['Omera LPG'] },
            { size: '35kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Omera LPG'] },
        ]
    },
    {
        name: 'Jamuna LPG',
        logo: createPlaceholder(200, 100, '#DAA520', 'Jamuna'),
        color20mm: '#DAA520',
        color22mm: '#B8860B',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#DAA520', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Jamuna LPG'] },
        ]
    },
    {
        name: 'Beximco LPG',
        logo: createPlaceholder(200, 100, '#008000', 'Beximco'),
        color20mm: '#008000',
        color22mm: '#006400',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#008000', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Beximco LPG'] },
        ]
    },
    {
        name: 'TotalGas',
        logo: createPlaceholder(200, 100, '#FF4500', 'Total'),
        color20mm: '#FF4500',
        color22mm: '#CD5C5C',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#FF4500', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['TotalGas'] },
        ]
    },
    {
        name: 'G-Gas',
        logo: createPlaceholder(200, 100, '#808080', 'G-Gas'),
        color20mm: '#808080',
        color22mm: '#696969',
        variants: [
            { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#808080', '12kg 20mm') },
            { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['G-Gas'] },
        ]
    },
    {
        name: 'Petromax LPG',
        logo: createPlaceholder(200, 100, '#0000FF', 'Petromax'),
        color20mm: '#0000FF',
        color22mm: '#00008B',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#0000FF', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Petromax LPG'] },
        ]
    },
    {
        name: 'BM Energy',
        logo: createPlaceholder(200, 100, '#8B4513', 'BM Energy'),
        color20mm: '#8B4513',
        color22mm: '#A0522D',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#8B4513', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['BM Energy'] },
        ]
    },
    {
        name: 'Navana LPG',
        logo: createPlaceholder(200, 100, '#FF69B4', 'Navana'),
        color20mm: '#FF69B4',
        color22mm: '#C71585',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#FF69B4', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Navana LPG'] },
        ]
    },
    {
        name: 'JMI LPG',
        logo: createPlaceholder(200, 100, '#800080', 'JMI'),
        color20mm: '#800080',
        color22mm: '#4B0082',
        variants: [
             { size: '12kg', regulator: '20mm', cylinderImage: createPlaceholder(150, 300, '#800080', '12kg 20mm') },
             { size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['JMI LPG'] },
        ]
    },
    // Add missing brands dynamically loop or explicit
    {
        name: 'Aygaz LPG',
        logo: createPlaceholder(200, 100, '#00BFFF', 'Aygaz'),
        color20mm: '#00BFFF',
        color22mm: '#1E90FF',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Aygaz LPG'] }]
    },
    {
        name: 'Bin Habeeb LPG',
        logo: createPlaceholder(200, 100, '#2E8B57', 'Bin Habeeb'),
        color20mm: '#2E8B57',
        color22mm: '#006400',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Bin Habeeb LPG'] }]
    },
    {
        name: 'Delta LPG',
        logo: createPlaceholder(200, 100, '#DC143C', 'Delta'),
        color20mm: '#DC143C',
        color22mm: '#8B0000',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Delta LPG'] }]
    },
    {
        name: 'Euro Gas',
        logo: createPlaceholder(200, 100, '#FF8C00', 'Euro'),
        color20mm: '#FF8C00',
        color22mm: '#FF4500',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Euro Gas'] }]
    },
    {
        name: 'Fresh LPG',
        logo: createPlaceholder(200, 100, '#32CD32', 'Fresh'),
        color20mm: '#32CD32',
        color22mm: '#228B22',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Fresh LPG'] }]
    },
    {
        name: 'Index LPG',
        logo: createPlaceholder(200, 100, '#4682B4', 'Index'),
        color20mm: '#4682B4',
        color22mm: '#4169E1',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Index LPG'] }]
    },
    {
        name: 'Laugfs Gas',
        logo: createPlaceholder(200, 100, '#FFFF00', 'Laugfs'),
        color20mm: '#FFFF00',
        color22mm: '#DAA520',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Laugfs Gas'] }]
    },
    {
        name: 'Orion Gas',
        logo: createPlaceholder(200, 100, '#9932CC', 'Orion'),
        color20mm: '#9932CC',
        color22mm: '#8B008B',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Orion Gas'] }]
    },
    {
        name: 'Promita LPG',
        logo: createPlaceholder(200, 100, '#FF1493', 'Promita'),
        color20mm: '#FF1493',
        color22mm: '#C71585',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Promita LPG'] }]
    },
    {
        name: 'Sena LPG',
        logo: createPlaceholder(200, 100, '#228B22', 'Sena'),
        color20mm: '#228B22',
        color22mm: '#006400',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Sena LPG'] }]
    },
    {
        name: 'Unigas',
        logo: createPlaceholder(200, 100, '#FF6347', 'Unigas'),
        color20mm: '#FF6347',
        color22mm: '#FF4500',
        variants: [{ size: '12kg', regulator: '22mm', cylinderImage: BRAND_ASSETS['Unigas'] }]
    },
    // Accessory Brands
    {
        name: 'RFL',
        logo: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668020/stockx/stoves/stove-1.png',
        color20mm: '#000000',
        color22mm: '#000000',
        variants: []
    },
    {
        name: 'Miyako',
        logo: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668025/stockx/stoves/stove-3.png',
        color20mm: '#000000',
        color22mm: '#000000',
        variants: []
    },
    {
        name: 'Walton',
        logo: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668027/stockx/stoves/stove-4.png',
        color20mm: '#000000',
        color22mm: '#000000',
        variants: []
    },
    {
        name: 'Generic',
        logo: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668031/stockx/regulators/regulator-20.png',
        color20mm: '#333333',
        color22mm: '#333333',
        variants: []
    },
    {
        name: 'Premium',
        logo: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668033/stockx/regulators/regulator-22.png',
        color20mm: '#333333',
        color22mm: '#333333',
        variants: []
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
