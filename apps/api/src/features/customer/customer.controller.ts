import { Request, Response } from 'express';
import { CustomerService } from './customer.service';
import { customerSchema } from '@repo/shared';

export class CustomerController {

  static async create(req: Request, res: Response) {
    try {
      const result = customerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const customer = await CustomerService.create(targetStoreId, result.data);
      return res.status(201).json({ customer });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Customer with this phone already exists in this store' });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const customers = await CustomerService.findByStore(targetStoreId);
      return res.status(200).json({ customers });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const customer = await CustomerService.findOne(req.params.id, targetStoreId);
      return res.status(200).json({ customer });
    } catch (error: any) {
      if (error.message === 'Customer not found') return res.status(404).json({ error: 'Customer not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const result = customerSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const customer = await CustomerService.update(req.params.id, targetStoreId, result.data);
      return res.status(200).json({ customer });
    } catch (error: any) {
      if (error.message === 'Customer not found') return res.status(404).json({ error: 'Customer not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      await CustomerService.delete(req.params.id, targetStoreId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.message === 'Customer not found') return res.status(404).json({ error: 'Customer not found' });
      return res.status(500).json({ error: error.message });
    }
  }
}
