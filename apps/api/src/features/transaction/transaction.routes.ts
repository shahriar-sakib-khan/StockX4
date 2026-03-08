import { Request, Response, NextFunction, Router } from 'express';
import { TransactionService } from './transaction.service';
import { CreateTransactionSchema } from '@repo/shared';
import { authenticate } from '../../middleware/auth.middleware';
import { StaffModel } from '../staff/staff.model';
import { z } from 'zod';

const router: Router = Router();

export class TransactionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateTransactionSchema.parse(req.body);
      const user = (req as any).user;
      let storeId = user.storeId || req.headers['x-store-id'];

      if (!storeId) {
          return res.status(400).json({ message: "Store Context Missing" });
      }

      // Resolve staffId for ANY authenticated user (Owner, Manager, Staff, Driver)
      let staffId: any;
      
      if (user.userId) {
          const transactor = await StaffModel.findOne({
              storeId,
              $or: [
                  { _id: user.userId },
                  { userId: user.userId }
              ]
          });
          if (transactor) {
              staffId = transactor._id;
          }
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
