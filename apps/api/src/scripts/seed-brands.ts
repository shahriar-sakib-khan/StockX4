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

// Local Brand Assets (served from public/brands)
const BRAND_ASSETS: Record<string, string> = {
  "Aygaz LPG": "/brands/aygaz/aygaz-22-12.png",
  "Bashundhara LPG": "/brands/bashundhara/bashundhara-22-12.png",
  "Beximco LPG": "/brands/beximco/beximco-22-12.png",
  "Bin Habeeb LPG": "/brands/bin_habeeb/binhabib-22-12.png",
  "BM Energy": "/brands/bm_energy/bm-22-12.png",
  "Delta LPG": "/brands/delta/delta-22-12.png",
  "Euro Gas": "/brands/euro/euro-22-12.png",
  "Fresh LPG": "/brands/fresh/fresh-22-12.png",
  "G-Gas": "/brands/g_gas/ggas-22-12.png",
  "Index LPG": "/brands/index/index-22-12.png",
  "Jamuna LPG": "/brands/jamuna/jamuna-22-12.png",
  "JMI LPG": "/brands/jmi/jmi-22-12.png",
  "Laugfs Gas": "/brands/laugfs/laugfs-22-12.png",
  "Navana LPG": "/brands/navana/navana-22-12.png",
  "Omera LPG": "/brands/omera/omera-22-12.png",
  "Orion Gas": "/brands/orion/orion-22-12.png",
  "Petromax LPG": "/brands/petromax/petromax-22-12.png",
  "Promita LPG": "/brands/promita/promita-22-12.png",
  "Sena LPG": "/brands/sena/shena-22-12.png",
  "TotalGas": "/brands/total/total-22-12.png",
  "Unigas": "/brands/unigas/unigas-22-12.png"
};

const brands = [
    {
        name: 'Bashundhara LPG',
        logo: '/brands/bashundhara/logo.png',
        cylinderImage: BRAND_ASSETS['Bashundhara LPG'],
        color: '#FF0000',
        type: 'cylinder',
    },
    {
        name: 'Omera LPG',
        logo: '/brands/omera/logo.png',
        cylinderImage: BRAND_ASSETS['Omera LPG'],
        color: '#FFD700',
        type: 'cylinder',
    },
    {
        name: 'Jamuna LPG',
        logo: '/brands/jamuna/logo.png',
        cylinderImage: BRAND_ASSETS['Jamuna LPG'],
        color: '#DAA520',
        type: 'cylinder',
    },
    {
        name: 'Beximco LPG',
        logo: '/brands/beximco/logo.png',
        cylinderImage: BRAND_ASSETS['Beximco LPG'],
        color: '#008000',
        type: 'cylinder',
    },
    {
        name: 'TotalGas',
        logo: '/brands/total/logo.png',
        cylinderImage: BRAND_ASSETS['TotalGas'],
        color: '#FF4500',
        type: 'cylinder',
    },
    {
        name: 'G-Gas',
        logo: '/brands/g_gas/logo.png',
        cylinderImage: BRAND_ASSETS['G-Gas'],
        color: '#808080',
        type: 'cylinder',
    },
    {
        name: 'Petromax LPG',
        logo: '/brands/petromax/logo.png',
        cylinderImage: BRAND_ASSETS['Petromax LPG'],
        color: '#0000FF',
        type: 'cylinder',
    },
    {
        name: 'BM Energy',
        logo: '/brands/bm_energy/logo.png',
        cylinderImage: BRAND_ASSETS['BM Energy'],
        color: '#8B4513',
        type: 'cylinder',
    },
    {
        name: 'Navana LPG',
        logo: '/brands/navana/logo.png',
        cylinderImage: BRAND_ASSETS['Navana LPG'],
        color: '#FF69B4',
        type: 'cylinder',
    },
    {
        name: 'JMI LPG',
        logo: '/brands/jmi/logo.png',
        cylinderImage: BRAND_ASSETS['JMI LPG'],
        color: '#800080',
        type: 'cylinder',
    },
    {
        name: 'Aygaz LPG',
        logo: '/brands/aygaz/logo.png',
        cylinderImage: BRAND_ASSETS['Aygaz LPG'],
        color: '#00BFFF',
        type: 'cylinder',
    },
    {
        name: 'Bin Habeeb LPG',
        logo: '/brands/bin_habeeb/logo.png',
        cylinderImage: BRAND_ASSETS['Bin Habeeb LPG'],
        color: '#2E8B57',
        type: 'cylinder',
    },
    {
        name: 'Delta LPG',
        logo: '/brands/delta/logo.png',
        cylinderImage: BRAND_ASSETS['Delta LPG'],
        color: '#DC143C',
        type: 'cylinder',
    },
    {
        name: 'Euro Gas',
        logo: '/brands/euro/logo.png',
        cylinderImage: BRAND_ASSETS['Euro Gas'],
        color: '#FF8C00',
        type: 'cylinder',
    },
    {
        name: 'Fresh LPG',
        logo: '/brands/fresh/logo.png',
        cylinderImage: BRAND_ASSETS['Fresh LPG'],
        color: '#32CD32',
        type: 'cylinder',
    },
    {
        name: 'Index LPG',
        logo: '/brands/index/logo.png',
        cylinderImage: BRAND_ASSETS['Index LPG'],
        color: '#4682B4',
        type: 'cylinder',
    },
    {
        name: 'Laugfs Gas',
        logo: '/brands/laugfs/logo.png',
        cylinderImage: BRAND_ASSETS['Laugfs Gas'],
        color: '#FFFF00',
        type: 'cylinder',
    },
    {
        name: 'Orion Gas',
        logo: '/brands/orion/logo.png',
        cylinderImage: BRAND_ASSETS['Orion Gas'],
        color: '#9932CC',
        type: 'cylinder',
    },
    {
        name: 'Promita LPG',
        logo: '/brands/promita/logo.png',
        cylinderImage: BRAND_ASSETS['Promita LPG'],
        color: '#FF1493',
        type: 'cylinder',
    },
    {
        name: 'Sena LPG',
        logo: '/brands/sena/logo.png',
        cylinderImage: BRAND_ASSETS['Sena LPG'],
        color: '#228B22',
        type: 'cylinder',
    },
    {
        name: 'Unigas',
        logo: '/brands/unigas/logo.png',
        cylinderImage: BRAND_ASSETS['Unigas'],
        color: '#FF6347',
        type: 'cylinder',
    },
    // Stoves
    {
        name: 'RFL',
        logo: createPlaceholder(200, 100, '#FF0000', 'RFL'),
        cylinderImage: '/stoves/stove-1.png', // Default, will be overridden by variant logic in UI/Component usually, but good for base
        color: '#FF0000',
        type: 'stove',
    },
    {
        name: 'Miyako',
        logo: createPlaceholder(200, 100, '#000000', 'Miyako'),
        cylinderImage: '/stoves/stove-2.png',
        color: '#000000',
        type: 'stove',
    },
    {
        name: 'Walton',
        logo: createPlaceholder(200, 100, '#0000FF', 'Walton'),
        cylinderImage: '/stoves/stove-3.png',
        color: '#0000FF',
        type: 'stove',
    },
    {
        name: 'Gazi',
        logo: createPlaceholder(200, 100, '#FFA500', 'Gazi'),
        cylinderImage: '/stoves/stove-2.png',
        color: '#FFA500',
        type: 'stove',
    },
    {
        name: 'Vision',
        logo: createPlaceholder(200, 100, '#800080', 'Vision'),
        cylinderImage: '/stoves/stove-4.png',
        color: '#800080',
        type: 'stove',
    },
    // Regulators
    {
        name: 'Generic',
        logo: createPlaceholder(200, 100, '#808080', 'Generic'),
        cylinderImage: '/regulators/regulator-20.png',
        color: '#808080',
        type: 'regulator',
    },
    {
        name: 'Premium',
        logo: createPlaceholder(200, 100, '#DAA520', 'Premium'),
        cylinderImage: '/regulators/regulator-22.png',
        color: '#DAA520',
        type: 'regulator',
    },
    {
        name: 'Safety Plus',
        logo: createPlaceholder(200, 100, '#008000', 'Safety+'),
        cylinderImage: '/regulators/regulator-22.png',
        color: '#008000',
        type: 'regulator',
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockx');
        console.log('Connected to DB');

        console.log('Seeding Global Brands (Upsert Mode)...');

        let updatedCount = 0;
        let createdCount = 0;

        // Import StoreBrand model dynamically or use mongoose.model if already registered
        // Check if model is registered, else define it inline or import.
        // Best to use the existing model definition if possible, but for script simplicity we can use string identifier if model names are stable.
        const StoreBrand = mongoose.models.StoreBrand || mongoose.model('StoreBrand', new mongoose.Schema({
             globalBrandId: { type: mongoose.Schema.Types.ObjectId },
             name: String,
             logo: String,
             cylinderImage: String,
             color: String,
             type: String,
             // ... other fields not strictly needed for this update
        }));

        for (const brand of brands) {
            // Upsert GlobalBrand
            const globalBrand = await GlobalBrand.findOneAndUpdate(
                { name: brand.name },
                { $set: brand },
                { upsert: true, new: true }
            );

            if (globalBrand) {
                // Propagate to StoreBrand
                await StoreBrand.updateMany(
                    { globalBrandId: globalBrand._id },
                    {
                        $set: {
                            name: brand.name,
                            logo: brand.logo,
                            cylinderImage: brand.cylinderImage,
                            color: brand.color,
                            type: brand.type
                        }
                    }
                );
            }
        }

        console.log('Seeding Complete. Brands Updated/Created and propagated to stores.');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seed();
