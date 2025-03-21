import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCartMutation } = useCart();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleAddToCart = () => {
    addToCartMutation.mutate({
      productId: product.id,
      quantity: 1
    });
  };
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl || `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-secondary-500 hover:bg-secondary-600">
            Featured
          </Badge>
        )}
        
        <div className={cn(
          "absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 transition-opacity", 
          isHovered && "opacity-100"
        )}>
          <div className="flex space-x-2">
            <Link href={`/products/${product.id}`}>
              <Button size="sm" variant="secondary" className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Quick View
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-700 line-clamp-1 hover:text-primary-600 cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {product.description ? product.description.slice(0, 100) : "No description available"}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm font-semibold text-gray-900">{formattedPrice}</div>
        <Button 
          size="sm" 
          onClick={handleAddToCart} 
          disabled={!user || addToCartMutation.isPending} 
          variant="default"
          className="flex items-center gap-1"
        >
          <ShoppingCart className="h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
