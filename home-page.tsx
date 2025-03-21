import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ProductGrid } from "@/components/products/product-grid";
import { ArrowRight, Search, ShoppingCart, Zap, User, Shield, Truck } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ["/api/products/featured"],
  });
  
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Background pattern" 
            className="w-full h-full object-cover"
          />
        </div>
        <Container className="relative py-16 sm:py-24 lg:py-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                Revolutionizing<br/>
                <span className="text-secondary-500">Online Shopping</span>
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl">
                ShopSmart is redefining e-commerce with personalized recommendations, seamless checkout, and exclusive deals.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row">
                <Link href="/products">
                  <Button className="bg-secondary-500 hover:bg-secondary-600 text-white py-3 px-6 rounded-md font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mb-4 sm:mb-0">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="sm:ml-4 text-white border border-white py-3 px-6 rounded-md font-medium text-lg hover:bg-white hover:text-primary-800 transition-colors inline-flex items-center justify-center">
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative lg:col-start-2">
              <div className="relative lg:max-w-lg lg:mx-auto rounded-lg shadow-2xl overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="ShopSmart Platform Preview" 
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-4 sm:p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-500 text-white mb-2">
                      Featured
                    </span>
                    <h3 className="text-xl font-semibold text-white">Intuitive Shopping Interface</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose ShopSmart?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We've reimagined the online shopping experience to make it faster, smarter, and more personalized.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-700 rounded-md shadow-lg">
                        <Search className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Advanced Product Search</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Find exactly what you're looking for with our intelligent search algorithms and detailed filtering options.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-700 rounded-md shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Fast Checkout Process</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Streamlined, secure checkout with saved payment methods and address information for faster purchases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-700 rounded-md shadow-lg">
                        <User className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Personalized Recommendations</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Get product suggestions based on your browsing history, preferences, and shopping patterns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-700 rounded-md shadow-lg">
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Mobile-First Experience</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Designed for optimal performance across all devices, with special attention to mobile shopping experiences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-700 rounded-md shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Enhanced Security</h3>
                    <p className="mt-5 text-base text-gray-500">
                      State-of-the-art encryption and security measures to protect your personal and payment information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-700 rounded-md shadow-lg">
                        <Truck className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Real-Time Order Tracking</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Follow your orders from purchase to delivery with detailed status updates at every step of the process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Check out our most popular items and latest additions.
            </p>
          </div>

          <div className="mt-12">
            <ProductGrid products={featuredProducts || []} isLoading={isLoading} />
          </div>

          <div className="mt-12 text-center">
            <Link href="/products">
              <Button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-primary-100 mx-auto">
              Join us today and enjoy a personalized, seamless shopping experience.
            </p>
            <div className="mt-8">
              {user ? (
                <Link href="/products">
                  <Button className="bg-secondary-500 hover:bg-secondary-600 text-white py-3 px-8 rounded-md font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    Start Shopping
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="bg-secondary-500 hover:bg-secondary-600 text-white py-3 px-8 rounded-md font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    Sign Up Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
