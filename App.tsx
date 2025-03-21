import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailsPage from "@/pages/product-details-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ProtectedRoute } from "@/lib/protected-route";

// Admin pages
import AdminDashboardPage from "@/pages/admin/dashboard-page";
import AdminProductsPage from "@/pages/admin/products-page";
import AdminOrdersPage from "@/pages/admin/orders-page";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailsPage} />
          <Route path="/cart" component={CartPage} />
          <ProtectedRoute path="/checkout" component={CheckoutPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Admin routes */}
          <ProtectedRoute path="/admin" component={AdminDashboardPage} adminOnly />
          <ProtectedRoute path="/admin/products" component={AdminProductsPage} adminOnly />
          <ProtectedRoute path="/admin/orders" component={AdminOrdersPage} adminOnly />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
