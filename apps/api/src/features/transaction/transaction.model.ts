import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';
import { CreateTransactionSchema, TransactionItemSchema as ZodTransactionItemSchema } from '@repo/shared';

// Derive Types from Zod
export type ITransactionItem = z.infer<typeof ZodTransactionItemSchema>;

export interface ITransaction extends Document {
    storeId: Types.ObjectId;
    staffId?: Types.ObjectId;
    customerId?: Types.ObjectId;
    customerType?: 'Customer' | 'Shop';
    items: ITransactionItem[]; // Zod says string, Mongoose stores ObjectId. Mongoose hydrates string -> ObjectId usually? No, it hydrates to ObjectId.
    // If we want ITransaction to return pure objects, we should probably stick to what Mongoose returns.
    // However, for simplicity let's stick to the Zod interface and assume Mongoose casts.

    totalAmount: number;
    finalAmount: number;
    paidAmount: number;
    dueAmount: number;
    type: 'SALE' | 'RETURN' | 'EXCHANGE';
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    paymentMethod: 'CASH' | 'DIGITAL' | 'DUE';
    createdAt: Date;
    updatedAt: Date;
}

const MongoTransactionItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true, refPath: 'items.type' },
    type: { type: String, enum: ['CYLINDER', 'ACCESSORY'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    variant: { type: String },
}, { _id: false });

const TransactionSchema = new Schema<ITransaction>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    customerId: { type: Schema.Types.ObjectId, refPath: 'customerType' },
    customerType: { type: String, enum: ['Customer', 'Shop'] },
    items: [MongoTransactionItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    finalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    type: { type: String, enum: ['SALE', 'RETURN', 'EXCHANGE'], default: 'SALE' },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
    paymentMethod: { type: String, enum: ['CASH', 'DIGITAL', 'DUE'], default: 'CASH' },
}, { timestamps: true });

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
