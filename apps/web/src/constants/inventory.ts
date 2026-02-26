export const CYLINDER_SIZES = [
    '5.5kg (mini)',
    '12kg',
    '12.5kg',
    '15kg',
    '20kg',
    '25kg',
    '30kg',
    '33kg',
    '35kg',
    '45kg',
    '50kg'
];

export const REGULATOR_TYPES = ['20mm', '22mm'];

// Helper to generate all possible SKU combinations for seeding or catalog generation
export const CYLINDER_VARIANTS = CYLINDER_SIZES.flatMap(size =>
    REGULATOR_TYPES.map(regulator => ({ size, regulator }))
);
