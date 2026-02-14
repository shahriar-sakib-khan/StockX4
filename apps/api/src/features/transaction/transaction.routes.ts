import { Request, Response, NextFunction, Router } from 'express';
import { TransactionService } from './transaction.service';
import { CreateTransactionSchema } from '@repo/shared';
import { authenticate } from '../../middleware/auth.middleware';
import { z } from 'zod';

const router: Router = Router();

export class TransactionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateTransactionSchema.parse(req.body);
      // storeId comes from Auth middleware (Staff or Owner)
      // If Staff, req.user.storeId. If Owner (testing?), might need param.
      // Assuming 'requireAuth' populates 'req.user' which has 'storeId' for Staff.

      const user = (req as any).user;

      // storeId can come from:
      // 1. Staff Token (user.storeId)
      // 2. Request Header 'x-store-id' (for Owners/Admins acting on a store)
      let storeId = user.storeId || req.headers['x-store-id'];

      let staffId = user.role === 'staff' ? user.userId : undefined;

      if (!storeId) {
           return res.status(400).json({ message: "Store Context Missing" });
      }

      const transaction = await TransactionService.create(storeId, staffId, data);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
        const user = (req as any).user;
        const storeId = user.storeId || req.headers['x-store-id'];

        if (!storeId) return res.status(400).json({ message: "Store Context Missing" });

        const history = await TransactionService.getHistory(storeId, req.query);
        res.json(history);
    } catch (error) {
        next(error);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction) {
      try {
          const user = (req as any).user;
          const storeId = user.storeId || req.headers['x-store-id'];

          if (!storeId) return res.status(400).json({ message: "Store Context Missing" });

          const summary = await TransactionService.getSummary(storeId, req.query);
          res.json(summary);
      } catch (error) {
          next(error);
      }
  }
}

router.get('/summary', authenticate, TransactionController.getSummary);
router.post('/', authenticate, TransactionController.create);
router.get('/', authenticate, TransactionController.getHistory);

export default router;
