const fs = require('fs');
const path = require('path');

const brandsDir = path.join(__dirname, '../public/brands');

const mapping = {
    'aygaz-brand.png': 'aygaz',
    'bashundhara-brand.png': 'bashundhara',
    'beximco-brand.png': 'beximco',
    'binhabib-brand.png': 'bin_habeeb',
    'bm-brand.png': 'bm_energy',
    'delta-brand.png': 'delta',
    'euro-brand.png': 'euro',
    'fresh-brand.png': 'fresh',
    'ggas-brand.png': 'g_gas',
    'index-brand.png': 'index',
    'jamuna-brand.png': 'jamuna',
    'jmi-brand.png': 'jmi',
    'laugfs-brand.png': 'laugfs',
    'navana-brand.png': 'navana',
    'omera-brand.png': 'omera',
    'orion-brand.png': 'orion',
    'petromax-brand.png': 'petromax',
    'promita-brand.png': 'promita',
    'shena-brand.png': 'sena',
    'total-brand.png': 'total',
    'unigas-brand.png': 'unigas'
};

if (!fs.existsSync(brandsDir)) {
    console.error('Brands directory not found:', brandsDir);
    process.exit(1);
}

Object.entries(mapping).forEach(([filename, folderName]) => {
    const srcPath = path.join(brandsDir, filename);
    const destFolder = path.join(brandsDir, folderName);
    const destPath = path.join(destFolder, 'logo.png');

    if (fs.existsSync(srcPath)) {
        if (!fs.existsSync(destFolder)) {
            console.log(`Creating folder: ${folderName}`);
            fs.mkdirSync(destFolder, { recursive: true });
        }

        fs.renameSync(srcPath, destPath);
        console.log(`Moved ${filename} -> ${folderName}/logo.png`);
    } else {
        console.warn(`Source file not found: ${filename}`);
    }
});
