import { CustomerModel, ICustomer } from './customer.model';
import { CustomerInput } from '@repo/shared';

export class CustomerService {
  static async create(storeId: string, data: CustomerInput): Promise<ICustomer> {
    const customer = await CustomerModel.create({ ...data, storeId });
    return customer;
  }

  static async findByStore(storeId: string): Promise<ICustomer[]> {
    return CustomerModel.find({ storeId }).sort({ createdAt: -1 });
  }

  static async findOne(customerId: string, storeId: string): Promise<ICustomer> {
    const customer = await CustomerModel.findOne({ _id: customerId, storeId });
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  static async update(customerId: string, storeId: string, data: Partial<CustomerInput>): Promise<ICustomer> {
    const customer = await CustomerModel.findOneAndUpdate(
      { _id: customerId, storeId },
      { $set: data },
      { new: true }
    );
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  static async delete(customerId: string, storeId: string): Promise<void> {
    const result = await CustomerModel.findOneAndDelete({ _id: customerId, storeId });
    if (!result) throw new Error('Customer not found');
  }
}
