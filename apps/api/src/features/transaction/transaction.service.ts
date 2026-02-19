import { Transaction, ITransaction, ITransactionItem } from './transaction.model';
import { CreateTransactionInput } from '@repo/shared';
import { CylinderService } from '../cylinder/cylinder.service';
import { CustomerService } from '../customer/customer.service';
import { StoreInventory } from '../cylinder/cylinder.model';
import { CustomerModel } from '../customer/customer.model';
import { ShopModel } from '../shop/shop.model';
import { StaffModel } from '../staff/staff.model';
import mongoose from 'mongoose';


export class TransactionService {
  static async create(
    storeId: string,
    staffId: string | undefined,
    data: CreateTransactionInput
  ): Promise<ITransaction> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Calculate Total & Prepare Items
      let totalAmount = 0;
      const itemsWithSubtotal: (ITransactionItem & { subtotal: number })[] = data.items.map((item) => {
        const subtotal = item.quantity * item.unitPrice;
        totalAmount += subtotal;
        return {
          productId: item.productId,
          type: item.type,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal,
          variant: item.variant,
          name: item.name || 'Unknown Item',
          size: item.size,
          regulator: item.regulator,
          description: item.description,
          isReturn: (item as any).isReturn || false, // Cast to any to bypass strict Zod type input for now
        };
      });

      // 2. Prepare Transaction Data
      const finalAmount = data.finalAmount ?? totalAmount;
      const paidAmount = data.paidAmount ?? 0;
      const dueAmount = finalAmount - paidAmount;

      const transaction = new Transaction({
        storeId,
        staffId,
        customerId: data.customerId,
        customerType: data.customerType,
        items: itemsWithSubtotal,
        totalAmount,
        finalAmount,
        paidAmount,
        dueAmount,
        type: data.type,
        paymentMethod: data.paymentMethod,
        status: 'COMPLETED',
      });

      await transaction.save({ session });

      // 3. Update Customer/Shop Due Balance
      if (data.type === 'DUE_PAYMENT') {
          // DUE_PAYMENT means user is PAYING OFF debt.
          // paidAmount decreases totalDue.
          const payment = data.paidAmount;
          if (payment > 0 && data.customerId && data.customerType) {
              if (data.customerType === 'Customer') {
                  await CustomerModel.findByIdAndUpdate(
                      data.customerId,
                      { $inc: { totalDue: -payment } }
                  ).session(session);
              } else if (data.customerType === 'Shop') {
                   await ShopModel.findByIdAndUpdate(
                      data.customerId,
                      { $inc: { totalDue: -payment } }
                  ).session(session);
              }
          }
      } else if (data.type === 'EXPENSE' && itemsWithSubtotal.length > 0) {
          // Salary Payment Logic
          for (const item of itemsWithSubtotal) {
             if (item.name && item.name.toLowerCase().includes('salary') && item.productId) {
                 await StaffModel.findByIdAndUpdate(item.productId, {
                     $inc: { salaryDue: -(item.subtotal || 0) }
                 }, { session });
             }
          }
      }


      // Normal Transaction with Due (moved outside else-if chain to allow Expense + Due mixed if ever needed, but mainly to fit structure)
      if (data.type !== 'DUE_PAYMENT' && dueAmount > 0 && data.customerId && data.customerType) {
          // Normal Transaction with Due
          if (data.customerType === 'Customer') {
              await CustomerModel.findByIdAndUpdate(
                  data.customerId,
                  { $inc: { totalDue: dueAmount } }
              ).session(session);
          } else if (data.customerType === 'Shop') {
               await ShopModel.findByIdAndUpdate(
                  data.customerId,
                  { $inc: { totalDue: dueAmount } }
              ).session(session);
          }
      }

      // 4. Update Inventory (Atomic Logic)
      if (data.type !== 'DUE_PAYMENT') { // Skip inventory for due payments
          for (const item of itemsWithSubtotal) {
            if (item.type === 'CYLINDER') {
                 // Logic based on Item Direction (isReturn) or Transaction Type
                if (item.isReturn === true || data.type === 'RETURN') {
                    // Incoming Empty (Return)
                    await StoreInventory.updateOne(
                        { _id: item.productId, storeId } as any,
                        { $inc: { 'counts.empty': item.quantity } }
                    ).session(session);
                } else if (data.type === 'SALE') {
                    // Outgoing Full (Sale)
                    await StoreInventory.updateOne(
                        { _id: item.productId, storeId } as any,
                        { $inc: { 'counts.full': -item.quantity } }
                    ).session(session);
                }
            }
          }
      }

      await session.commitTransaction();
      session.endSession();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction Create Error:', error);
      throw error;
    }
  }

  static async getHistory(storeId: string, filters: any = {}) {
      const query: any = { storeId };

      if (filters.customerId) {
          query.customerId = filters.customerId;
      }

      if (filters.search) {
          // Note: This requires populating customer/shop first or aggregate.
          // For simplicity, we search on fields present in Transaction or do a separate lookup.
          // To search by Customer Name, we need to find customers with that name first.
          // OR if we stored customerName on Transaction (which we didn't explicitly, but might have snapshot).
          // Let's check the schema. If strict relation, we need aggregation.
          // For now, let's assume we can search by Invoice ID (last 6 chars) or exact match context.
          // Or we find customers matching name and use their IDs.

          // Let's use aggregation for advanced search if needed, or keeping it simple:
          // specific search not implemented fully without more schema context.
          // Let's try to match ID or implicit simple fields if any.
      }

      if (filters.startDate || filters.endDate) {
          query.createdAt = {};
          if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
          if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      if (filters.minAmount) {
          query.finalAmount = { ...query.finalAmount, $gte: Number(filters.minAmount) };
      }
      if (filters.maxAmount) {
          query.finalAmount = { ...query.finalAmount, $lte: Number(filters.maxAmount) };
      }

      if (filters.type) {
          query.type = filters.type;
      }
      if (filters.customerType) {
          query.customerType = filters.customerType;
      }
      if (filters.paymentMethod) {
          query.paymentMethod = filters.paymentMethod;
      }

      const page = Number(filters.page) || 1;
      const limit = Number(filters.limit) || 20;
      const skip = (page - 1) * limit;

      const sort: any = {};
      if (filters.sortBy) {
          sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
      } else {
          sort.createdAt = -1;
      }

      const [transactions, total] = await Promise.all([
          Transaction.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('staffId', 'name')
            .populate('customerId', 'name type'), // Populate customer details
          Transaction.countDocuments(query)
      ]);

      return {
          data: transactions,
          meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit)
          }
      };
  }

  static async getSummary(storeId: string, filters: any = {}) {
      const matchStage: any = { storeId: new mongoose.Types.ObjectId(storeId) };

      if (filters.startDate || filters.endDate) {
          matchStage.createdAt = {};
          if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
          if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
      }

      if (filters.type) matchStage.type = filters.type;

      const summary = await Transaction.aggregate([
          { $match: matchStage },
          {
              $group: {
                  _id: null,
                  totalSales: {
                      $sum: {
                          $cond: [{ $eq: ["$type", "SALE"] }, "$finalAmount", 0]
                      }
                  },
                  totalExpenses: {
                      $sum: {
                          $cond: [{ $eq: ["$type", "EXPENSE"] }, "$finalAmount", 0]
                      }
                  },
                  totalDueCollected: {
                      $sum: {
                          $cond: [{ $eq: ["$type", "DUE_PAYMENT"] }, "$paidAmount", 0]
                      }
                  },
                  totalDuePending: {
                       $sum: "$dueAmount"
                  },
                  totalReturns: {
                      $sum: {
                          $cond: [{ $eq: ["$type", "RETURN"] }, "$finalAmount", 0]
                      }
                  },
                  count: { $sum: 1 }
              }
          }
      ]);

      return summary[0] || {
          totalSales: 0,
          totalExpenses: 0,
          totalDueCollected: 0,
          totalDuePending: 0,
          totalReturns: 0,
          count: 0
      };
  }
}
