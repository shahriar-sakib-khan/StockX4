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
      let storeId = user.storeId;
      let staffId = user.role === 'staff' ? user.userId : undefined;

      // Fallback for Owner accessing POS directly (if supported, implies picking a store)
      // For now, assuming Staff context mostly.
      if (!storeId && user.role === 'admin') {
          // If admin, maybe storeId is passed in body or query?
          // Simplification: POS is for Staff.
          // If Owner uses POS, they should "Login" to a store context or we use the storeId from body if available (not in schema currently)
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
        const storeId = user.storeId;
        if (!storeId) return res.status(400).json({ message: "Store Context Missing" });

        const history = await TransactionService.getHistory(storeId, req.query);
        res.json(history);
    } catch (error) {
        next(error);
    }
  }
}

router.post('/', authenticate, TransactionController.create);
router.get('/', authenticate, TransactionController.getHistory);

export default router;
