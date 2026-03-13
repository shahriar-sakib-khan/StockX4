import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';
import { CreateTransactionSchema, TransactionItemSchema as ZodTransactionItemSchema } from '@repo/shared';

// Derive Types from Zod
export type ITransactionItem = z.infer<typeof ZodTransactionItemSchema> & { isReturn?: boolean; isSettled?: boolean };

export interface ITransaction extends Document {
    storeId: Types.ObjectId;
    staffId?: Types.ObjectId;
    customerId?: Types.ObjectId;
    customerType?: 'retail' | 'wholesale' | 'Customer' | 'Vehicle';
    customerModel?: 'Customer' | 'Vehicle';
    items: ITransactionItem[]; // Zod says string, Mongoose stores ObjectId. Mongoose hydrates string -> ObjectId usually? No, it hydrates to ObjectId.
    // If we want ITransaction to return pure objects, we should probably stick to what Mongoose returns.
    // However, for simplicity let's stick to the Zod interface and assume Mongoose casts.

    totalAmount: number;
    finalAmount: number;
    paidAmount: number;
    dueAmount: number;
    invoiceNumber: string;
    type: 'SALE' | 'RETURN' | 'EXCHANGE' | 'DUE_PAYMENT' | 'EXPENSE';
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    paymentMethod: 'CASH' | 'DIGITAL' | 'DUE';
    dueCylinders?: {
        productId: string;
        brandName: string;
        quantity: number;
        size?: string;
        regulator?: string;
        image?: string;
    }[];
    transactorName?: string;
    transactorRole?: string;
    receiptUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MongoTransactionItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'StoreProduct' },
    name: { type: String, required: true },
    type: { type: String, enum: ['CYLINDER', 'ACCESSORY', 'EXPENSE', 'REFILL', 'EMPTY', 'PACKAGED', 'SERVICE', 'FUEL', 'REPAIR', 'REFUND'], required: true },
    category: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    wholesalePrice: { type: Number, min: 0 },
    retailPrice: { type: Number, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    variant: { type: String },
    size: { type: String },
    regulator: { type: String },
    description: { type: String },
    saleType: { type: String, enum: ['PACKAGED', 'REFILL', 'RETURN', 'DUE'] },
    burners: { type: Number },
    isReturn: { type: Boolean, default: false },
    isSettled: { type: Boolean, default: false },
}, { _id: false });

const TransactionSchema = new Schema<ITransaction>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    customerId: { type: Schema.Types.ObjectId, refPath: 'customerModel' },
    customerType: { type: String, enum: ['retail', 'wholesale', 'Customer', 'Vehicle'] },
    customerModel: { type: String, enum: ['Customer', 'Vehicle'] },
    items: [MongoTransactionItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    finalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['SALE', 'RETURN', 'EXCHANGE', 'DUE_PAYMENT', 'EXPENSE', 'DUE_CYLINDER_SETTLEMENT'], default: 'SALE' },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
    paymentMethod: { type: String, enum: ['CASH', 'DIGITAL', 'DUE'], default: 'CASH' },
    dueCylinders: [
        {
            productId: { type: String, required: true },
            brandName: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            size: { type: String },
            regulator: { type: String },
            image: { type: String },
            _id: false
        }
    ],
    transactorName: { type: String },
    transactorRole: { type: String },
    receiptUrl: { type: String },
}, { timestamps: true });

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
