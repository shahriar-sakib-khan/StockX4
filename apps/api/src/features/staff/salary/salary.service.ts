import { Transaction } from '../../transaction/transaction.model';
import { StaffModel } from '../staff.model';
import mongoose from 'mongoose';
import { StoreModel } from '../../store/store.model';

export interface PaySalaryInput {
  amount: number;
  bonusAmount?: number;
  bonusNote?: string;
  paymentMethod?: 'CASH' | 'DIGITAL';
}

export class SalaryService {
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

  private static async generateInvoiceNumber(storeId: string, session: mongoose.ClientSession) {
    const now = new Date();
    const datePart =
      now.getDate().toString().padStart(2, '0') +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getFullYear().toString().slice(-2);

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const dailyCount = await Transaction.countDocuments({
      storeId: new mongoose.Types.ObjectId(storeId),
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    } as any).session(session);

    const sequencePart = this.getAlphabetSequence(dailyCount);
    const store = await StoreModel.findById(storeId).session(session);
    const storeCode = store?.code || store?.name.split(' ').map((w: string) => w[0]).join('').toUpperCase() || 'ST';
    return `${datePart}${sequencePart}-${storeCode}`;
  }

  /**
   * Pay salary to a staff member. Creates a SALARY transaction and
   * decrements salaryDue atomically. Optionally includes a bonus amount.
   */
  static async paySalary(
    storeId: string,
    staffId: string,
    data: PaySalaryInput
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const staff = await StaffModel.findOne({ _id: staffId, storeId }).session(session);
      if (!staff) throw Object.assign(new Error('Staff not found'), { status: 404 });

      const totalAmount = data.amount + (data.bonusAmount || 0);
      const invoiceNumber = await this.generateInvoiceNumber(storeId, session);

      // Build transaction items
      const items: any[] = [];

      // Salary item (always present, affects salaryDue)
      if (data.amount > 0) {
        items.push({
          productId: staff._id,
          type: 'ACCESSORY',
          quantity: 1,
          unitPrice: data.amount,
          subtotal: data.amount,
          name: `Salary Payment - ${staff.name}`,
          description: `Monthly salary payment for ${staff.name}`,
        });
      }

      // Bonus item (optional, does NOT affect salaryDue)
      if (data.bonusAmount && data.bonusAmount > 0) {
        items.push({
          productId: staff._id,
          type: 'ACCESSORY',
          quantity: 1,
          unitPrice: data.bonusAmount,
          subtotal: data.bonusAmount,
          name: `Bonus Payment - ${staff.name}`,
          description: data.bonusNote || 'Bonus payment',
        });
      }

      const transaction = new Transaction({
        storeId,
        staffId: staff._id,
        items,
        totalAmount,
        finalAmount: totalAmount,
        paidAmount: totalAmount,
        dueAmount: 0,
        invoiceNumber,
        type: 'SALARY',
        paymentMethod: data.paymentMethod || 'CASH',
        status: 'COMPLETED',
      });

      await transaction.save({ session });

      // Only the salary amount decrements salaryDue (not bonus)
      if (data.amount > 0) {
        await StaffModel.findByIdAndUpdate(
          staffId,
          { $inc: { salaryDue: -data.amount } },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get salary payment history for a specific staff member (server-side query).
   */
  static async getSalaryHistory(
    storeId: string,
    staffId: string,
    filters: { page?: number; limit?: number } = {}
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query = {
      storeId: new mongoose.Types.ObjectId(storeId),
      type: 'SALARY' as const,
      'items.productId': staffId,
    };

    const [data, total] = await Promise.all([
      Transaction.find(query as any)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('staffId', 'name role'),
      Transaction.countDocuments(query as any),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Process monthly salary accruals.
   * Also applies pending salary changes when their effective date arrives.
   *
   * CRITICAL FIX: Updates lastSalaryProcessed after accrual so it won't
   * double-accrue on next call.
   */
  static async processMonthlySalaries(storeId: string) {
    const staffMembers = await StaffModel.find({
      storeId,
      isActive: true,
      salaryEnabled: true,
    });

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const staff of staffMembers) {
      // Apply pending salary change if effective date has arrived
      if (
        staff.pendingSalary != null &&
        staff.salaryEffectiveDate &&
        staff.salaryEffectiveDate <= currentMonth
      ) {
        staff.salary = staff.pendingSalary;
        staff.pendingSalary = undefined;
        staff.salaryEffectiveDate = undefined;
      }

      if (!staff.salary || staff.salary <= 0) continue;

      const lastProcessed = staff.lastSalaryProcessed || staff.createdAt;
      const monthsDiff =
        (now.getFullYear() - lastProcessed.getFullYear()) * 12 +
        (now.getMonth() - lastProcessed.getMonth());

      if (monthsDiff > 0) {
        staff.salaryDue = (staff.salaryDue || 0) + staff.salary * monthsDiff;
        staff.lastSalaryProcessed = currentMonth;
      }

      await staff.save();
    }
  }
}
