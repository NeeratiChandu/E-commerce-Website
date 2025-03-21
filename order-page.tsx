import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Fetch orders
  const { 
    data: orders = [], 
    isLoading: isOrdersLoading 
  } = useQuery({
    queryKey: ["/api/orders"],
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter orders based on search and status
  const filteredOrders = orders.filter((order: any) => {
    let matchesSearch = true;
    let matchesStatus = true;
    
    if (searchQuery) {
      matchesSearch = 
        order.id.toString().includes(searchQuery) ||
        order.shippingAddress.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    if (statusFilter) {
      matchesStatus = order.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Handle view order details
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };
  
  // Handle update order status
  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
  if (isOrdersLoading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-xl font-medium">Loading orders...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders and shipments</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="space-y-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle>Order Management</CardTitle>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full md:w-64"
                />
              </div>
              
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
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
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Total</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order: any) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 px-2 text-sm font-medium">#{order.id}</td>
                      <td className="py-3 px-2 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-2 text-sm">User #{order.userId}</td>
                      <td className="py-3 px-2 text-sm font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3 px-2">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            View Details
                          </Button>
                          
                          <Select 
                            defaultValue={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order details dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Order Status</h3>
                <div>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
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
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Order Summary</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium">{formatPrice(selectedOrder.totalAmount - (selectedOrder.totalAmount * 0.1))}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Tax</dt>
                    <dd className="text-sm font-medium">{formatPrice(selectedOrder.totalAmount * 0.1)}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-base font-medium">Total</dt>
                    <dd className="text-base font-bold">{formatPrice(selectedOrder.totalAmount)}</dd>
                  </div>
                </dl>
              </div>
              
              <Separator />
              
              <Accordion type="single" collapsible>
                <AccordionItem value="actions">
                  <AccordionTrigger className="text-sm font-medium">Update Order Status</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'pending' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'pending')}
                        disabled={selectedOrder.status === 'pending'}
                      >
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'processing' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
                        disabled={selectedOrder.status === 'processing'}
                      >
                        Processing
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'shipped' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')}
                        disabled={selectedOrder.status === 'shipped'}
                      >
                        Shipped
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'delivered' ? 'default' : 'outline'}import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Eye, Check, X, AlertCircle, Calendar, Package, Truck, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  
  // Fetch all orders
  const { 
    data: orders = [], 
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["/api/orders"],
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsUpdateStatusDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filtered orders based on search and status filter
  const filteredOrders = orders.filter((order: any) => {
    let matches = true;
    
    // Search filter
    if (searchQuery) {
      const searchTerms = [
        String(order.id),
        order.shippingAddress,
        String(order.totalAmount),
        order.status,
      ];
      matches = searchTerms.some(term => 
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter && matches) {
      matches = order.status === statusFilter;
    }
    
    return matches;
  });
  
  // Handle view order details
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };
  
  // Handle update order status
  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setIsUpdateStatusDialogOpen(true);
  };
  
  // Submit status update
  const submitStatusUpdate = (status: string) => {
    if (selectedOrder) {
      updateOrderStatusMutation.mutate({
        id: selectedOrder.id,
        status: status
      });
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };
  
  // Loading state
  if (isOrdersLoading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-xl font-medium">Loading orders...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders and shipments</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" onClick={() => refetchOrders()}>
            Refresh Orders
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <CardTitle>Order Management</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full md:w-64"
                />
              </div>
              
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {renderOrdersTable(filteredOrders)}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {renderOrdersTable(orders.filter((order: any) => order.status === "pending"))}
            </TabsContent>
            
            <TabsContent value="processing" className="space-y-4">
              {renderOrdersTable(orders.filter((order: any) => order.status === "processing"))}
            </TabsContent>
            
            <TabsContent value="shipped" className="space-y-4">
              {renderOrdersTable(orders.filter((order: any) => order.status === "shipped"))}
            </TabsContent>
            
            <TabsContent value="delivered" className="space-y-4">
              {renderOrdersTable(orders.filter((order: any) => order.status === "delivered"))}
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-4">
              {renderOrdersTable(orders.filter((order: any) => order.status === "cancelled"))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Order details dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                  <div className="mt-2 flex items-center">
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <h3 className="text-sm font-medium text-gray-500">Order Total</h3>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                <p>User ID: {selectedOrder.userId}</p>
                <p className="mt-4 text-sm font-medium text-gray-500">Shipping Address:</p>
                <p className="whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items && selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden mr-4">
                          <img
                            src={item.product.imageUrl || `https://via.placeholder.com/64?text=${encodeURIComponent(item.product.name)}`}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  className="mr-2" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsUpdateStatusDialogOpen(true);
                  }}
                >
                  Update Status
                </Button>
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Update order status dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Status</h3>
                <div className="flex items-center">
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status To</h3>
                <div className="grid grid-cols-1 gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="justify-start h-auto py-3" disabled={selectedOrder.status === "pending"}>
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Pending</div>
                          <div className="text-xs text-gray-500">Order received but not yet processed</div>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to change the order status to Pending?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => submitStatusUpdate("pending")}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="justify-start h-auto py-3" disabled={selectedOrder.status === "processing"}>
                        <Package className="h-5 w-5 text-blue-500 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Processing</div>
                          <div className="text-xs text-gray-500">Order is being prepared for shipping</div>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to change the order status to Processing?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => submitStatusUpdate("processing")}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="justify-start h-auto py-3" disabled={selectedOrder.status === "shipped"}>
                        <Truck className="h-5 w-5 text-purple-500 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Shipped</div>
                          <div className="text-xs text-gray-500">Order has been shipped to the customer</div>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to change the order status to Shipped?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => submitStatusUpdate("shipped")}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="justify-start h-auto py-3" disabled={selectedOrder.status === "delivered"}>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Delivered</div>
                          <div className="text-xs text-gray-500">Order has been delivered to the customer</div>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to change the order status to Delivered?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => submitStatusUpdate("delivered")}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="justify-start h-auto py-3" disabled={selectedOrder.status === "cancelled"}>
                        <X className="h-5 w-5 text-red-500 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Cancelled</div>
                          <div className="text-xs text-gray-500">Order has been cancelled</div>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to change the order status to Cancelled? This action may be irreversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => submitStatusUpdate("cancelled")}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
  
  // Helper function to render orders table
  function renderOrdersTable(orders: any[]) {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Order ID</th>
              <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Customer</th>
              <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Items</th>
              <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Total</th>
              <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b">
                <td className="py-4 px-2 text-sm font-medium">#{order.id}</td>
                <td className="py-4 px-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4 px-2 text-sm">User #{order.userId}</td>
                <td className="py-4 px-2 text-sm">{order.items?.length || 0}</td>
                <td className="py-4 px-2 text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                <td className="py-4 px-2 text-sm">{getStatusBadge(order.status)}</td>
                <td className="py-4 px-2 text-sm">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(order)}>
                      <Check className="h-4 w-4 mr-1" />
                      Status
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
