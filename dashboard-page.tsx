import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, DollarSign, Users, ShoppingCart, BarChart2, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboardPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch orders for dashboard
  const { 
    data: orders = [], 
    isLoading: isOrdersLoading 
  } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user?.isAdmin,
  });
  
  // Fetch products for dashboard
  const { 
    data: products = [], 
    isLoading: isProductsLoading 
  } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!user?.isAdmin,
  });
  
  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading 
  } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user?.isAdmin,
  });
  
  // Dashboard statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter((product: any) => product.inventory < 10).length;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Chart data
  const orderStatusData = [
    { name: 'Pending', value: orders.filter((order: any) => order.status === 'pending').length },
    { name: 'Processing', value: orders.filter((order: any) => order.status === 'processing').length },
    { name: 'Shipped', value: orders.filter((order: any) => order.status === 'shipped').length },
    { name: 'Delivered', value: orders.filter((order: any) => order.status === 'delivered').length },
    { name: 'Cancelled', value: orders.filter((order: any) => order.status === 'cancelled').length },
  ];
  
  const productCategoryData = categories.map((category: any) => ({
    name: category.name,
    products: products.filter((product: any) => product.categoryId === category.id).length,
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];
  
  // Recent orders for display
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Loading state
  if (isOrdersLoading || isProductsLoading || isCategoriesLoading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-xl font-medium">Loading dashboard...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your store and monitor performance</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button onClick={() => navigate('/admin/products')}>
            Manage Products
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            View Orders
          </Button>
        </div>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{totalOrders}</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Products</p>
                <h3 className="text-2xl font-bold mt-1">{totalProducts}</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +5 new this month
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <h3 className="text-2xl font-bold mt-1">{pendingOrders}</h3>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  Requires attention
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="text-base">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-base">
            Recent Orders
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-base">
            Inventory
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Monthly revenue and order trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Jan', orders: 25, revenue: 5200 },
                        { name: 'Feb', orders: 30, revenue: 6100 },
                        { name: 'Mar', orders: 28, revenue: 5800 },
                        { name: 'Apr', orders: 35, revenue: 7200 },
                        { name: 'May', orders: 32, revenue: 6500 },
                        { name: 'Jun', orders: 40, revenue: 8200 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') return ['$' + value, 'Revenue'];
                          return [value, 'Orders'];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Orders" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>
                  Distribution of orders by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Number of products by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productCategoryData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [value, 'Products']} />
                      <Bar dataKey="products" fill="#82ca9d" name="Products" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest orders across your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Order ID</th>
                        <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Date</th>
                        <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Customer</th>
                        <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Amount</th>
                        <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order: any) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-3 px-2 text-sm">{order.id}</td>
                          <td className="py-3 px-2 text-sm">{formatDate(order.createdAt)}</td>
                          <td className="py-3 px-2 text-sm">User #{order.userId}</td>
                          <td className="py-3 px-2 text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                          <td className="py-3 px-2">{getStatusBadge(order.status)}</td>
                          <td className="py-3 px-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => navigate('/admin/orders')}>
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>
                Monitor product stock levels and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Card className="flex-1">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-500 mb-2">Total Products</h3>
                      <div className="text-3xl font-bold">{totalProducts}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="flex-1">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-500 mb-2">Low Stock Items</h3>
                      <div className="text-3xl font-bold text-amber-600">{lowStockProducts}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="flex-1">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-500 mb-2">Categories</h3>
                      <div className="text-3xl font-bold">{categories.length}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="font-semibold text-lg mt-8 mb-4">Low Stock Products</h3>
                {products.filter((product: any) => product.inventory < 10).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-md">
                    <p className="text-gray-500">All products have sufficient stock</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Product</th>
                          <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Category</th>
                          <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Price</th>
                          <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Stock</th>
                          <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter((product: any) => product.inventory < 10)
                          .map((product: any) => (
                            <tr key={product.id} className="border-b">
                              <td className="py-3 px-2">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-3">
                                    <img 
                                      src={product.imageUrl || `https://via.placeholder.com/40?text=${encodeURIComponent(product.name.charAt(0))}`}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="font-medium text-sm">{product.name}</div>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-sm">
                                {categories.find((c: any) => c.id === product.categoryId)?.name || 'Unknown'}
                              </td>
                              <td className="py-3 px-2 text-sm">{formatCurrency(product.price)}</td>
                              <td className="py-3 px-2 text-sm font-medium">{product.inventory}</td>
                              <td className="py-3 px-2">
                                {product.inventory === 0 ? (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => navigate('/admin/products')}>
                    Manage Products
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
