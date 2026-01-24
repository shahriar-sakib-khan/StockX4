import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';

interface BuyProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onAddToCart: (item: any, quantity: number, totalAmount: number, unitPrice: number) => void;
}

export const BuyProductModal = ({ isOpen, onClose, product, onAddToCart }: BuyProductModalProps) => {
    const [quantity, setQuantity] = useState<number | ''>('');
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
            setTotalAmount('');
            setUnitPrice('');
        }
    }, [isOpen]);

    const handleQuantityChange = (val: string) => {
        const qty = val === '' ? '' : Number(val);
        setQuantity(qty);

        if (qty !== '' && unitPrice !== '') {
            setTotalAmount(Number(qty) * Number(unitPrice));
        } else if (qty === '') {
             setTotalAmount('');
        }
    };

    const handleTotalChange = (val: string) => {
        const total = val === '' ? '' : Number(val);
        setTotalAmount(total);

        if (total !== '' && quantity !== '' && Number(quantity) > 0) {
            setUnitPrice(Number(total) / Number(quantity));
        }
    };

    const handleUnitChange = (val: string) => {
        const unit = val === '' ? '' : Number(val);
        setUnitPrice(unit);

        if (unit !== '' && quantity !== '') {
            setTotalAmount(Number(unit) * Number(quantity));
        }
    };

    const handleAddToCart = () => {
        if (!quantity || !totalAmount || !unitPrice) return;

        onAddToCart(
            product,
            Number(quantity),
            Number(totalAmount),
            Number(unitPrice)
        );
        onClose();
    };

    if (!product) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Buy ${product.name}`}>
            <div className="space-y-6">
                {/* Product Info */}
                <div className="bg-muted/30 p-4 rounded-xl border space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                            <h3 className="font-bold text-lg">{product.name}</h3>
                        </div>
                        <div className="text-right">
                             {product.type === 'stove' && (
                                 <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                                     {product?.burnerCount} burner
                                 </span>
                             )}
                             {product.type === 'regulator' && (
                                 <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                     {product?.size}
                                 </span>
                             )}
                        </div>
                    </div>
                    {product.modelNumber && <p className="text-sm font-mono">Model: {product.modelNumber}</p>}
                </div>

                {/* Quantity */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Quantity</label>
                    <div className="flex items-center gap-2">
                            <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0"
                            onClick={() => handleQuantityChange(String(Math.max(0, Number(quantity || 0) - 1)))}
                        >
                            -
                        </Button>
                        <Input
                            type="number"
                            placeholder="0"
                            className="text-center text-lg font-bold h-10"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            autoFocus
                        />
                            <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0"
                            onClick={() => handleQuantityChange(String(Number(quantity || 0) + 1))}
                        >
                            +
                        </Button>
                    </div>
                </div>

                {/* Price Section */}
                <div className={`space-y-4 transition-opacity ${!quantity ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Total D.O. Amount (৳)</label>
                        <Input
                            type="number"
                            placeholder="Enter total amount..."
                            className="text-lg h-12"
                            value={totalAmount}
                            onChange={(e) => handleTotalChange(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Unit Price</span>
                            </div>
                            <div className="relative w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">৳</span>
                                <Input
                                type="number"
                                className="pl-6 h-9 bg-white text-right font-medium"
                                value={unitPrice}
                                onChange={(e) => handleUnitChange(e.target.value)}
                                />
                            </div>
                    </div>
                </div>

                <Button
                    className="w-full h-12 text-lg"
                    disabled={!quantity || !totalAmount || !unitPrice}
                    onClick={handleAddToCart}
                >
                    + Add to Cart
                </Button>
            </div>
        </Modal>
    );
};
