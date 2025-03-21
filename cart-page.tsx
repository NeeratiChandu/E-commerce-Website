import { useCart } from "@/hooks/use-cart";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartItemRow } from "@/components/cart/cart-item";
import { Link, useLocation } from "wouter";
import { ShoppingBag, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CartPage() {
  const [_, navigate] = useLocation();
  const { cart, isLoading, totalItems, totalPrice, clearCartMutation } = useCart();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-xl font-medium">Loading your cart...</span>
        </div>
      </Container>
    );
  }

  // Empty cart state
  if (!user || cart.length === 0) {
    return (
      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Shopping Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            {user ? 
              "Looks like you haven't added any products to your cart yet." : 
              "Please log in to view your cart and start shopping."}
          </p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
          {!user && (
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Log In
              </Button>
            </div>
          )}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 flex justify-between items-center border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Items ({totalItems})
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
              >
                Clear Cart
              </Button>
            </div>
            
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.id} className="p-6">
                  <CartItemRow item={item} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {totalPrice >= 50 ? 'Free' : formatPrice(5.99)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(totalPrice * 0.1)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      totalPrice + 
                      (totalPrice < 50 ? 5.99 : 0) + 
                      (totalPrice * 0.1)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Free Shipping</AlertTitle>
            <AlertDescription>
              Enjoy free shipping on all orders over $50!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Container>
  );
}
