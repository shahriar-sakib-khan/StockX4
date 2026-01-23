import { ShopModel, IShop } from './shop.model';
import { ShopInput } from '@repo/shared';

export class ShopService {
  static async create(storeId: string, data: ShopInput): Promise<IShop> {
    const shop = await ShopModel.create({ ...data, storeId });
    return shop;
  }

  static async findByStore(storeId: string): Promise<IShop[]> {
    return ShopModel.find({ storeId }).sort({ createdAt: -1 });
  }

  static async findOne(shopId: string, storeId: string): Promise<IShop> {
    const shop = await ShopModel.findOne({ _id: shopId, storeId });
    if (!shop) throw new Error('Shop not found');
    return shop;
  }

  static async update(shopId: string, storeId: string, data: Partial<ShopInput>): Promise<IShop> {
    const shop = await ShopModel.findOneAndUpdate(
      { _id: shopId, storeId },
      { $set: data },
      { new: true }
    );
    if (!shop) throw new Error('Shop not found');
    return shop;
  }

  static async delete(shopId: string, storeId: string): Promise<void> {
    const result = await ShopModel.findOneAndDelete({ _id: shopId, storeId });
    if (!result) throw new Error('Shop not found');
  }
}
