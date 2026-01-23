import { ProductModel, IProduct } from './product.model';
import { ProductInput } from '@repo/shared';

export class ProductService {
  static async create(storeId: string, data: ProductInput): Promise<IProduct> {
    const product = await ProductModel.create({ ...data, storeId });
    return product;
  }

  static async findByStore(storeId: string): Promise<IProduct[]> {
    return ProductModel.find({ storeId }).sort({ createdAt: -1 });
  }

  static async findOne(productId: string, storeId: string): Promise<IProduct> {
    const product = await ProductModel.findOne({ _id: productId, storeId });
    if (!product) throw new Error('Product not found');
    return product;
  }

  static async update(productId: string, storeId: string, data: Partial<ProductInput>): Promise<IProduct> {
    const product = await ProductModel.findOneAndUpdate(
      { _id: productId, storeId },
      { $set: data },
      { new: true }
    );
    if (!product) throw new Error('Product not found');
    return product;
  }

  static async delete(productId: string, storeId: string): Promise<void> {
    const result = await ProductModel.findOneAndDelete({ _id: productId, storeId });
    if (!result) throw new Error('Product not found');
  }
}
