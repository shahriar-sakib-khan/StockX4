import { Transaction, ITransaction, ITransactionItem } from './transaction.model';
import { CreateTransactionInput } from '@repo/shared';
// Removed unused CylinderService import
import { CustomerService } from '../customer/customer.service';
import { StoreInventory } from '../inventory/inventory.model';
import { CustomerModel } from '../customer/customer.model';
import { StaffModel } from '../staff/staff.model';
import { ProductModel } from '../product/product.model';
import mongoose from 'mongoose';


import { StoreModel } from '../store/store.model';

export class TransactionService {
  /**
   * Generates alphabetical sequence: A, B, C... Z, AA, AB...
   */
  private static getAlphabetSequence(num: number): string {
    let result = '';
    while (num >= 0) {
      result = String.fromCharCode((num % 26) + 65) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  }

  static async create(
    storeId: string,
    staffId: string | undefined,
    data: CreateTransactionInput
  ): Promise<ITransaction> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 0. Generate Custom Invoice Number
      const now = new Date();
      const datePart = (now.getDate().toString().padStart(2, '0')) +
                       ((now.getMonth() + 1).toString().padStart(2, '0')) +
                       (now.getFullYear().toString().slice(-2));

      // Count transactions for this store today
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const dailyCount = await Transaction.countDocuments({
          storeId: new mongoose.Types.ObjectId(storeId),
          createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).session(session);

      const sequencePart = this.getAlphabetSequence(dailyCount);

      // Get Store Code
      const store = await StoreModel.findById(storeId).session(session);
      const storeCode = store?.code || store?.name.split(' ').map(w => w[0]).join('').toUpperCase() || 'ST';

      const invoiceNumber = `${datePart}${sequencePart}-${storeCode}`;

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
          saleType: (item as any).saleType,
          burners: (item as any).burners,
          category: (item as any).category,
          isReturn: (item as any).isReturn || false,
          isSettled: (item as any).isSettled || false,
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
        customerModel: data.customerType === 'Vehicle' ? 'Vehicle' : (data.customerId ? 'Customer' : undefined),
        items: itemsWithSubtotal,
        totalAmount,
        finalAmount,
        paidAmount,
        dueAmount,
        invoiceNumber,
        type: data.type,
        paymentMethod: data.paymentMethod,
        status: 'COMPLETED',
        // Add dueCylinders to transaction if it exists
        ...(data.dueCylinders ? { dueCylinders: data.dueCylinders } : {}),
        transactorName: data.transactorName,
        transactorRole: data.transactorRole,
        receiptUrl: data.receiptUrl
      });

      await transaction.save({ session });

      // Populate details for the response
      await transaction.populate([
          { path: 'storeId', select: 'name location ownerPhone slug' },
          { path: 'staffId', select: 'name role' },
          { path: 'customerId', select: 'name type phone address district ownerName' }
      ]);

      // 3. Update Customer/Shop Due Balance
      if (data.type === 'DUE_PAYMENT') {
          // DUE_PAYMENT means user is PAYING OFF debt.
          // paidAmount decreases totalDue.
          const payment = data.paidAmount;
          if (payment > 0 && data.customerId && data.customerType) {
              if (['retail', 'wholesale', 'Customer'].includes(data.customerType)) {
                  await CustomerModel.findByIdAndUpdate(
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
      if (data.type !== 'DUE_PAYMENT' && data.customerId && data.customerType) {
          if (['retail', 'wholesale', 'Customer'].includes(data.customerType)) {
              const customerUpdates: mongoose.UpdateQuery<any> = {};

              if (dueAmount > 0) {
                  customerUpdates.$inc = { totalDue: dueAmount };
              }

              // Handle Due Cylinders explicitly selected from POS
              if (data.dueCylinders && data.dueCylinders.length > 0) {
                  const customer = await CustomerModel.findById(data.customerId).session(session);
                  if (customer) {
                      const currentDueCylinders = customer.dueCylinders || [];

                      for (const dueItem of data.dueCylinders) {
                          const existingIndex = currentDueCylinders.findIndex(c => c.productId === dueItem.productId);
                          if (existingIndex > -1) {
                              currentDueCylinders[existingIndex].quantity += dueItem.quantity;
                          } else {
                              currentDueCylinders.push({
                                  productId: dueItem.productId,
                                  brandName: dueItem.brandName,
                                  quantity: dueItem.quantity,
                                  size: dueItem.size,
                                  regulator: dueItem.regulator,
                                  image: dueItem.image,
                              });
                          }
                      }

                      customerUpdates.$set = { dueCylinders: currentDueCylinders };
                  }
              }

              if (Object.keys(customerUpdates).length > 0) {
                  await CustomerModel.findByIdAndUpdate(
                      data.customerId,
                      customerUpdates
                  ).session(session);
              }

              // Handle Due Cylinder Settlement (if items have isSettled: true)
              const settledItems = itemsWithSubtotal.filter(i => i.isSettled);
              if (settledItems.length > 0) {
                  const customer = await CustomerModel.findById(data.customerId).session(session);
                  if (customer && customer.dueCylinders) {
                      const currentDueCylinders = [...customer.dueCylinders];
                      for (const settledItem of settledItems) {
                          // USE String() to avoid ObjectId vs string comparison issues
                          const existingIndex = currentDueCylinders.findIndex(c => String(c.productId) === String(settledItem.productId));
                          if (existingIndex > -1) {
                              currentDueCylinders[existingIndex].quantity -= settledItem.quantity;
                              if (currentDueCylinders[existingIndex].quantity <= 0) {
                                  currentDueCylinders.splice(existingIndex, 1);
                              }
                          }
                      }
                      await CustomerModel.findByIdAndUpdate(data.customerId, { $set: { dueCylinders: currentDueCylinders } }).session(session);
                  }
              }
          }
      }

      if (data.type !== 'DUE_PAYMENT') {
          for (const item of itemsWithSubtotal) {
          const query = {
            productId: new mongoose.Types.ObjectId(item.productId as any),
            storeId: new mongoose.Types.ObjectId(storeId)
          };

              const itemType = item.type?.toUpperCase();
              const category = item.category?.toLowerCase();

              if (itemType === 'CYLINDER') {
                  // Cylinder logic: differentiates between Full and Empty
                  if (item.isReturn === true || item.isSettled === true || data.type === 'RETURN' || data.type === 'DUE_CYLINDER_SETTLEMENT') {
                      // Incoming Empty
                      await StoreInventory.updateOne(
                          query as any,
                          { $inc: { 'counts.empty': item.quantity } },
                          { upsert: true } // Ensure record exists
                      ).session(session);
                  } else if (data.type === 'SALE') {
                      // Outgoing Full / Packaged
                      const saleType = (item as any).saleType;

                      const incQuery: any = {};

                      if (saleType === 'PACKAGED') {
                          // Selling a completely new, packaged cylinder
                          incQuery['counts.packaged'] = -item.quantity;
                      } else {
                          // Standard REFILL: Give full, no automatic empty increment (empties are handled by explicit isReturn items)
                          incQuery['counts.full'] = -item.quantity;
                      }

                      await StoreInventory.updateOne(
                          query as any,
                          { $inc: incQuery },
                          { upsert: true }
                      ).session(session);
                  }
              } else if (itemType === 'ACCESSORY' || category === 'stove' || category === 'regulator' || category === 'pipe' || category === 'accessory') {
                  // Accessories/Stoves/Regulators: Only track "full" (available stock) in StoreInventory
                  const increment = (item.isReturn === true || item.isSettled === true || data.type === 'RETURN' || data.type === 'DUE_CYLINDER_SETTLEMENT') ? item.quantity : -item.quantity;
                  await StoreInventory.updateOne(
                      query as any,
                      { $inc: { 'counts.full': increment } },
                      { upsert: true }
                  ).session(session);
              } else {
                  // Default fallback for any other types
                  const increment = (item.isReturn === true || item.isSettled === true || data.type === 'RETURN' || data.type === 'DUE_CYLINDER_SETTLEMENT') ? item.quantity : -item.quantity;
                  await StoreInventory.updateOne(
                      query as any,
                      { $inc: { 'counts.full': increment } },
                      { upsert: true }
                  ).session(session);
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
            .populate('staffId', 'name role')
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
                  cashIncome: {
                      $sum: {
                          $cond: [
                              { $and: [
                                  { $eq: ["$paymentMethod", "CASH"] },
                                  { $in: ["$type", ["SALE", "DUE_PAYMENT"]] }
                              ]},
                              "$paidAmount",
                              0
                          ]
                      }
                  },
                  digitalIncome: {
                      $sum: {
                          $cond: [
                              { $and: [
                                  { $eq: ["$paymentMethod", "DIGITAL"] },
                                  { $in: ["$type", ["SALE", "DUE_PAYMENT"]] }
                              ]},
                              "$paidAmount",
                              0
                          ]
                      }
                  },
                  count: { $sum: 1 }
              }
          },
          {
              $project: {
                  _id: 0,
                  totalSales: 1,
                  totalExpenses: 1,
                  totalDueCollected: 1,
                  totalDuePending: 1,
                  totalReturns: 1,
                  cashIncome: 1,
                  digitalIncome: 1,
                  count: 1,
                  netCashFlow: { $subtract: [{ $add: ["$cashIncome", "$digitalIncome"] }, "$totalExpenses"] }
              }
          }
      ]);

      return summary[0] || {
          totalSales: 0,
          totalExpenses: 0,
          totalDueCollected: 0,
          totalDuePending: 0,
          totalReturns: 0,
          cashIncome: 0,
          digitalIncome: 0,
          netCashFlow: 0,
          count: 0
      };
  }
}
