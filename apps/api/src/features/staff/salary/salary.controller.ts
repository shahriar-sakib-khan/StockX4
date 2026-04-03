import { Response } from 'express';
import { AuthRequest } from '../../../middleware/auth.middleware';
import { SalaryService, PaySalaryInput } from './salary.service';
import { StoreService } from '../../store/store.service';
import { z } from 'zod';

const PaySalarySchema = z.object({
  amount: z.number().nonnegative('Amount must be non-negative'),
  bonusAmount: z.number().nonnegative().optional(),
  bonusNote: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'DIGITAL']).optional().default('CASH'),
});

export class SalaryController {
  static async paySalary(req: AuthRequest, res: Response) {
    try {
      const { storeId, staffId } = req.params;
      const userId = req.user!.userId;
      await StoreService.findOne(storeId, userId);

      const result = PaySalarySchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.errors });

      const transaction = await SalaryService.paySalary(storeId, staffId, result.data);
      return res.status(201).json({ transaction });
    } catch (error: any) {
      if (error.status === 404) return res.status(404).json({ error: error.message });
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Salary payment failed' });
    }
  }

  static async getSalaryHistory(req: AuthRequest, res: Response) {
    try {
      const { storeId, staffId } = req.params;
      const userId = req.user!.userId;
      await StoreService.findOne(storeId, userId);

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const history = await SalaryService.getSalaryHistory(storeId, staffId, { page, limit });
      return res.status(200).json(history);
    } catch (error: any) {
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Failed to fetch salary history' });
    }
  }

  static async processAccruals(req: AuthRequest, res: Response) {
    try {
      const { storeId } = req.params;
      const userId = req.user!.userId;
      await StoreService.findOne(storeId, userId);

      await SalaryService.processMonthlySalaries(storeId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Salary accrual processing failed' });
    }
  }
}
