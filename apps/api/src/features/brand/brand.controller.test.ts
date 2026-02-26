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
                    logo: 'logo.png',
                    cylinderImage: 'cyl.png',
                    color: '#FF0000',
                    type: 'cylinder'
                });

            if (res.status !== 201) console.log('POST /brands ERROR:', res.body);
            expect(res.status).toBe(201);
            expect(res.body.brand).toHaveProperty('_id');
            expect(res.body.brand.name).toBe('Bashundhara');
        });
    });

    describe('GET /brands', () => {
        it('should return all brands', async () => {
             await GlobalBrand.create({
                name: 'Bashundhara',
                logo: 'logo.png',
                cylinderImage: 'cyl.png',
                color: '#FF0000',
                type: 'cylinder'
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
                logo: 'logo.png',
                cylinderImage: 'cyl.png',
                color: '#000000',
                type: 'cylinder'
            });

            const res = await request(app)
                .put(`/brands/${brand._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New Name',
                    logo: 'logo2.png',
                    cylinderImage: 'cyl2.png',
                    color: '#FF0000',
                    type: 'cylinder'
                });

            if (res.status !== 200) console.log('PUT /brands/:id ERROR:', res.body);
            expect(res.status).toBe(200);
            expect(res.body.brand.name).toBe('New Name');
            expect(res.body.brand.color).toBe('#FF0000');
        });
    });

    describe('DELETE /brands/:id', () => {
        it('should delete a brand', async () => {
            const brand = await GlobalBrand.create({
                name: 'To Delete',
                logo: 'logo.png',
                cylinderImage: 'cyl.png',
                color: '#000000',
                type: 'cylinder'
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
