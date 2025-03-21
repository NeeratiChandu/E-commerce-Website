
import { CartItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface CartItemProps {
  item: CartItem & { product: Product };
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateCartItemMutation, removeFromCartMutation } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  const handleUpdateQuantity = () => {
    if (quantity !== item.quantity) {
      updateCartItemMutation.mutate({
        productId: item.productId,
        quantity
      });
    }
  };
  
  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateCartItemMutation.mutate({
      productId: item.productId,
      quantity: newQuantity
    });
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateCartItemMutation.mutate({
        productId: item.productId,
        quantity: newQuantity
      });
    }
  };
  
  const handleRemove = () => {
    removeFromCartMutation.mutate(item.productId);
  };
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(item.product.price);
  
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(item.product.price * item.quantity);
  
  return (
    <div className="flex flex-col sm:flex-row py-6 border-b">
      <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0">
        <img
          src={item.product.imageUrl || `https://via.placeholder.com/128x128?text=${encodeURIComponent(item.product.name)}`}
          alt={item.product.name}
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      <div className="sm:ml-6 flex-1 flex flex-col">
        <div className="flex justify-between">
          <div>
            <Link href={`/products/${item.product.id}`}>
              <h3 className="text-base font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
                {item.product.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {item.product.description ? item.product.description.slice(0, 100) : "No description available"}
            </p>
          </div>
          <p className="text-base font-medium text-gray-900">{formattedPrice}</p>
        </div>
        
        <div className="mt-auto pt-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || updateCartItemMutation.isPending}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              onBlur={handleUpdateQuantity}
              className="h-8 w-14 mx-1 text-center"
              disabled={updateCartItemMutation.isPending}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={incrementQuantity}
              disabled={updateCartItemMutation.isPending}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center">
            <p className="text-base font-medium text-gray-900 mr-4">{formattedTotal}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={removeFromCartMutation.isPending}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
