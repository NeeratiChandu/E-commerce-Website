import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/products/product-grid";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ShoppingCart, 
  ChevronRight, 
  Minus, 
  Plus, 
  ArrowLeft,
  ShoppingBag,
  Home
} from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const { addToCartMutation } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const {
    data: product,
    isLoading: isProductLoading,
    error,
  } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !isNaN(id),
  });
  
  // Fetch related products (same category)
  const { data: relatedProducts = [], isLoading: isRelatedLoading } = useQuery({
    queryKey: ["/api/products", { categoryId: product?.categoryId }],
    enabled: !!product?.categoryId,
  });
  
  // Fetch category details
  const { data: categories = [] } = useQuery({
    queryKey: ["/import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/products/product-grid";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Check,
  Truck,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const productId = parseInt(id as string);
  const { user } = useAuth();
  const { addToCartMutation } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { 
    data: product, 
    isLoading: isProductLoading, 
    error: productError 
  } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });

  // Fetch related products (products in the same category)
  const { 
    data: relatedProducts = [], 
    isLoading: isRelatedLoading 
  } = useQuery({
    queryKey: ['/api/products', { categoryId: product?.categoryId }],
    enabled: !!product?.categoryId,
  });

  // Fetch category details
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading 
  } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Handle quantity changes
  const incrementQuantity = () => {
    if (product && quantity < product.inventory) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      if (product && value <= product.inventory) {
        setQuantity(value);
      } else if (product) {
        setQuantity(product.inventory);
      }
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    if (product) {
      addToCartMutation.mutate({
        productId: product.id,
        quantity: quantity
      });
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Get category name
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Show loading state
  if (isProductLoading) {
    return (
      <Container className="py-12">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/products')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          
          <div>
            <Skeleton className="h-10 w-2/3 mb-2" />
            <Skeleton className="h-6 w-1/3 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-8" />
            <Skeleton className="h-10 w-1/3 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  // Show error state
  if (productError || !product) {
    return (
      <Container className="py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </Container>
    );
  }

  // Filter out current product from related products
  const filteredRelatedProducts = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <Container className="py-12">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <span className="text-sm text-gray-500">
          {getCategoryName(product.categoryId)}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={product.imageUrl || `https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-gray-900 mr-4">
              {formatPrice(product.price)}
            </span>
            
            {product.featured && (
              <Badge className="bg-secondary-500 hover:bg-secondary-600">
                Featured
              </Badge>
            )}
          </div>
          
          <div className="prose mb-6">
            <p className="text-gray-600">
              {product.description || "No description available for this product."}
            </p>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center text-sm text-gray-500 mr-6">
              <div className={`w-3 h-3 rounded-full mr-2 ${product.inventory > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{product.inventory > 0 ? `In Stock (${product.inventory} available)` : 'Out of Stock'}</span>
            </div>
            
            <div className="text-sm text-gray-500">
              SKU: P{product.id.toString().padStart(4, '0')}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Quantity selector */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.inventory}
                value={quantity}
                onChange={handleQuantityChange}
                className="h-10 w-20 mx-2 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= product.inventory}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Add to cart button */}
          <Button
            className="w-full mb-4"
            disabled={!user || product.inventory === 0 || addToCartMutation.isPending}
            onClick={handleAddToCart}
          >
            {addToCartMutation.isPending ? (
              "Adding to Cart..."
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
          
          {!user && (
            <p className="text-sm text-gray-500 text-center mb-4">
              Please <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>log in</Button> to add items to your cart.
            </p>
          )}
          
          {/* Product highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <Truck className="h-6 w-6 text-primary-700 mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Free Shipping</h3>
              <p className="text-xs text-gray-500">On orders over $50</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary-700 mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Secure Payment</h3>
              <p className="text-xs text-gray-500">Safe & encrypted</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <RefreshCw className="h-6 w-6 text-primary-700 mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Easy Returns</h3>
              <p className="text-xs text-gray-500">30 day money back</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product information tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none mb-8">
            <TabsTrigger value="description" className="rounded-none text-lg">Description</TabsTrigger>
            <TabsTrigger value="specifications" className="rounded-none text-lg">Specifications</TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-none text-lg">Shipping & Returns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Product Description</h3>
            <p>{product.description || "No detailed description available for this product."}</p>
          </TabsContent>
          
          <TabsContent value="specifications">
            <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <dl className="space-y-4">
                  <div className="border-b pb-4">
                    <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.id}</dd>
                  </div>
                  <div className="border-b pb-4">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getCategoryName(product.categoryId)}</dd>
                  </div>
                  <div className="border-b pb-4">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatPrice(product.price)}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <dl className="space-y-4">
                  <div className="border-b pb-4">
                    <dt className="text-sm font-medium text-gray-500">In Stock</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.inventory} units</dd>
                  </div>
                  <div className="border-b pb-4">
                    <dt className="text-sm font-medium text-gray-500">Featured Product</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.featured ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="border-b pb-4">
                    <dt className="text-sm font-medium text-gray-500">Added On</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="shipping">
            <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
            <div className="prose max-w-none">
              <h4 className="text-lg font-medium">Shipping Information</h4>
              <ul>
                <li>Free standard shipping on orders over $50</li>
                <li>Standard shipping: 3-5 business days</li>
                <li>Express shipping: 1-2 business days (additional fees apply)</li>
                <li>International shipping available to select countries</li>
              </ul>
              
              <h4 className="text-lg font-medium mt-6">Return Policy</h4>
              <ul>
                <li>30-day return policy for unused and unopened items</li>
                <li>Return shipping fees may apply</li>
                <li>Damaged or defective items can be returned for a full refund or replacement</li>
                <li>Contact customer service to initiate a return</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      {filteredRelatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <ProductGrid products={filteredRelatedProducts} isLoading={isRelatedLoading} />
        </div>
      )}
    </Container>
  );
}
