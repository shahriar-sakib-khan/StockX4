import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { connect, disconnect, clearDatabase } from '../../test/db';
import { GlobalBrand } from '../brand/brand.model';
import { User } from '../user/user.model';
import { StoreModel as Store } from '../store/store.model';
import { createToken } from '../../lib/jwt';

describe('Cylinder Removal Feature', () => {
    let token: string;
    let storeId: string;
    let userId: string;
    let brandId1: string;

    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await disconnect();
    });

    beforeEach(async () => {
        await clearDatabase();
        // Setup User, Store, Brand
        const user = await User.create({ name: 'Test', email: 't@t.com', password: '123', role: 'user' });
        userId = user._id.toString();
        const store = await Store.create({ name: 'S1', ownerId: userId, slug: 's1' });
        storeId = store._id.toString();
        token = createToken({ userId, role: user.role });

        const b1 = await GlobalBrand.create({ name: 'B1', color20mm: '#fff', color22mm: '#000', variants: [{size:'12kg',regulator:'20mm',price:{full:1,gas:1}}] });
        brandId1 = b1._id.toString();

        // Add Inventory
        await request(app)
            .post('/cylinders/inventory')
            .set('Authorization', `Bearer ${token}`)
            .set('x-store-id', storeId)
            .send({ globalBrandId: brandId1 });
    });

    it('should remove brand from inventory', async () => {
        const delRes = await request(app)
            .delete(`/cylinders/inventory/brands/${brandId1}`)
            .set('Authorization', `Bearer ${token}`)
            .set('x-store-id', storeId);

        expect(delRes.status).toBe(200);

        const res = await request(app)
            .get('/cylinders/inventory')
            .set('Authorization', `Bearer ${token}`)
            .set('x-store-id', storeId);

        expect(res.body.inventory).toHaveLength(0);
    });
});
