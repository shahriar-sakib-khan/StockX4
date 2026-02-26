import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary Env Vars');
    process.exit(1);
}

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const uploadFile = async (filePath: string, folder: string) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `stockx/${folder}`,
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Failed to upload ${filePath}:`, error);
        return null;
    }
};

const run = async () => {
    // Current CWD is apps/api
    const webPublicPath = path.resolve(process.cwd(), '../../apps/web/public');
    const stoveDir = path.join(webPublicPath, 'stoves');
    const regulatorDir = path.join(webPublicPath, 'regulators');

    console.log(`Checking Stoves at: ${stoveDir}`);
    console.log(`Checking Regulators at: ${regulatorDir}`);

    const uploads: Record<string, string> = {};

    // Upload Stoves
    if (fs.existsSync(stoveDir)) {
        const files = fs.readdirSync(stoveDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
        console.log(`Found ${files.length} stoves...`);
        for (const file of files) {
            const url = await uploadFile(path.join(stoveDir, file), 'stoves');
            if (url) {
                uploads[`stove:${file}`] = url;
                console.log(`✅ Uploaded ${file}`);
            }
        }
    }

    // Upload Regulators
    if (fs.existsSync(regulatorDir)) {
        const files = fs.readdirSync(regulatorDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
        console.log(`Found ${files.length} regulators...`);
        for (const file of files) {
            const url = await uploadFile(path.join(regulatorDir, file), 'regulators');
            if (url) {
                uploads[`regulator:${file}`] = url;
                console.log(`✅ Uploaded ${file}`);
            }
        }
    }

    console.log('\n--- UPLOAD SUMMARY ---');
    // Write to file for easier reading
    fs.writeFileSync(path.join(__dirname, '../../uploads.json'), JSON.stringify(uploads, null, 2));
    console.log('Written to uploads.json');
};

run();
