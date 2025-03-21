import { useState } from "react";
import { useLocation } from "wouter";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, CheckCircle2, Truck, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Checkout form schema
const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "Please enter your full shipping address"),
  paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
  cardHolder: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === "credit_card") {
    return !!data.cardNumber && !!data.cardExpiry && !!data.cardCVC && !!data.cardHolder;
  }
  return true;
}, {
  message: "Credit card details are required",
  path: ["cardNumber"],
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [_, navigate] = useLocation();
  const { cart, isLoading: isCartLoading, totalItems, totalPrice, clearCartMutation } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Form setup
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
      paymentMethod: "credit_card",
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
      cardHolder: user?.name || "",
    },
  });

  // Calculate order totals
  const subtotal = totalPrice;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Handle form submission
  const onSubmit = async (data: CheckoutForm) => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create order with items from cart
      const response = await apiRequest("POST", "/api/orders", {
        shippingAddress: data.shippingAddress,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
      
      const order = await response.json();
      setOrderId(order.id);
      setCheckoutComplete(true);
      
      // Clear cart after successful order
      await clearCartMutation.mutateAsync();
      
      // Show success toast
      toast({
        title: "Order Placed Successfully",
        description: `Your order #${order.id} has been placed and is being processed.`,
      });
      
      // Update user profile with shipping address if it was empty
      if (!user.address && data.shippingAddress) {
        await apiRequest("PUT", "/api/user/profile", {
          address: data.shippingAddress
        });
        
        // Update user data in cache
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    } catch (error: any) {
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isCartLoading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-xl font-medium">Loading checkout...</span>
        </div>
      </Container>
    );
  }

  // Order success state
  if (checkoutComplete) {
    return (
      <Container className="py-12">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-2xl mx-auto">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for your purchase. Your order #{orderId} has been placed and is being processed.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="font-medium mb-4 text-left">Order Summary</h2>
            <div className="space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              View Orders
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  // Empty cart or not logged in
  if (!user || cart.length === 0) {
    return (
      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            Add items to your cart before proceeding to checkout.
          </p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your full shipping address"
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="credit_card" id="credit_card" />
                              <Label htmlFor="credit_card" className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Credit/Debit Card
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="paypal" id="paypal" />
                              <Label htmlFor="paypal">PayPal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                              <Label htmlFor="bank_transfer">Bank Transfer</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("paymentMethod") === "credit_card" && (
                    <div className="mt-6 space-y-4">
                      <FormField
                        control={form.control}
                        name="cardHolder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cardholder Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Name on card" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input placeholder="•••• •••• •••• ••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardCVC"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl>
                                <Input placeholder="•••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {form.watch("paymentMethod") === "paypal" && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">
                        You will be redirected to PayPal to complete your payment once you place the order.
                      </p>
                    </div>
                  )}
                  
                  {form.watch("paymentMethod") === "bank_transfer" && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">
                        Bank transfer details will be provided after placing your order.
                      </p>
                      <p className="text-xs text-gray-500">
                        Note: Your order will only be processed after we receive the payment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Order Review and Submit */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible defaultValue="items">
                    <AccordionItem value="items">
                      <AccordionTrigger>Order Items ({totalItems})</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2">
                              <div className="flex items-center">
                                <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden mr-4">
                                  <img
                                    src={item.product.imageUrl || `https://via.placeholder.com/48?text=${encodeURIComponent(item.product.name)}`}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium">
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="flex-col items-stretch space-y-4">
                  <div className="flex items-center justify-center bg-gray-50 p-4 rounded-md">
                    <ShieldCheck className="h-5 w-5 text-primary-700 mr-2" />
                    <p className="text-sm text-gray-600">
                      Your personal data will be used to process your order, support your experience, and for other purposes described in our privacy policy.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Place Order - {formatPrice(total)}</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
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
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-start p-4 bg-gray-50 rounded-lg">
              <Truck className="h-5 w-5 text-primary-700 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Free Shipping</h3>
                <p className="text-xs text-gray-500">For orders over $50</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-gray-50 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-primary-700 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Secure Checkout</h3>
                <p className="text-xs text-gray-500">Your data is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
