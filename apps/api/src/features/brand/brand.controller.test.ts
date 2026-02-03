import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { connect, disconnect, clearDatabase } from '../../test/db';
import { GlobalBrand } from './brand.model';
import { User } from '../user/user.model';
import { createToken } from '../../lib/jwt';
import { BrandRoutes } from './brand.routes';

app.use('/brands', BrandRoutes);

describe('Brand Feature', () => {
    let token: string;

    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await disconnect();
    });

    beforeEach(async () => {
        await clearDatabase();

        const user = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });
        token = createToken({ userId: user._id.toString(), role: user.role });
    });

    describe('POST /brands', () => {
        it('should create a new global brand', async () => {
            const res = await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Bashundhara',
                    color20mm: '#FF0000',
                    color22mm: '#0000FF',
                    variants: [
                        { size: '12kg', regulator: '20mm' },
                        { size: '35kg', regulator: '22mm' }
                    ]
                });

            expect(res.status).toBe(201);
            expect(res.body.brand).toHaveProperty('_id');
            expect(res.body.brand.name).toBe('Bashundhara');
        });
    });

    describe('GET /brands', () => {
        it('should return all brands', async () => {
             await GlobalBrand.create({
                name: 'Bashundhara',
                color20mm: '#FF0000',
                color22mm: '#0000FF',
                variants: [{ size: '12kg', regulator: '20mm' }]
            });

            const res = await request(app)
                .get('/brands')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.brands).toHaveLength(1);
        });
    });

    describe('PUT /brands/:id', () => {
        it('should update a brand', async () => {
            const brand = await GlobalBrand.create({
                name: 'Old Name',
                color20mm: '#000000',
                color22mm: '#FFFFFF',
                variants: [{ size: '12kg', regulator: '20mm' }]
            });

            const res = await request(app)
                .put(`/brands/${brand._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New Name',
                    color20mm: '#FF0000',
                    color22mm: '#00FF00',
                    variants: brand.variants
                });

            expect(res.status).toBe(200);
            expect(res.body.brand.name).toBe('New Name');
            expect(res.body.brand.color20mm).toBe('#FF0000');
        });
    });

    describe('DELETE /brands/:id', () => {
        it('should delete a brand', async () => {
            const brand = await GlobalBrand.create({
                name: 'To Delete',
                color20mm: '#000000',
                color22mm: '#FFFFFF',
                variants: [{ size: '12kg', regulator: '20mm' }]
            });

            const res = await request(app)
                .delete(`/brands/${brand._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);

            const check = await GlobalBrand.findById(brand._id);
            expect(check).toBeNull();
        });
    });
});
