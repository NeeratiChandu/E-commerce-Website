import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Edit, Trash2, ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// Product form schema
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  imageUrl: z.string().optional(),
  categoryId: z.number().int("Category is required"),
  inventory: z.number().int().nonnegative("Inventory must be 0 or positive"),
  featured: z.boolean().default(false),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  
  // Product form
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: 0,
      inventory: 0,
      featured: false,
    },
  });
  
  // Fetch products
  const { 
    data: products = [], 
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["/api/products"],
  });
  
  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading 
  } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (product: ProductForm) => {
      const res = await apiRequest("POST", "/api/products", product);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setOpenDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ProductForm }) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setOpenDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filtered products based on search
  const filteredProducts = products.filter((product: any) => {
    if (!searchQuery) return true;
    
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  // Handle form submission
  const onSubmit = (data: ProductForm) => {
    if (isEditMode && selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };
  
  // Handle edit product
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId,
      inventory: product.inventory,
      featured: product.featured,
    });
    
    setOpenDialog(true);
  };
  
  // Handle delete product
  const handleDeleteProduct = (id: number) => {
    deleteProductMutation.mutate(id);
  };
  
  // Handle add new product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    
    form.reset({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: categories.length > 0 ? categories[0].id : 0,
      inventory: 0,
      featured: false,
    });
    
    setOpenDialog(true);
  };
  
  // Handle select/deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(products.map((product: any) => product.id));
    } else {
      setSelectedProductIds([]);
    }
  };
  
  // Handle select/deselect product
  const handleSelectProduct = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProductIds([...selectedProductIds, id]);
    } else {
      setSelectedProductIds(selectedProductIds.filter(productId => productId !== id));
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      for (const id of selectedProductIds) {
        await deleteProductMutation.mutateAsync(id);
      }
      
      setSelectedProductIds([]);
      
      toast({
        title: "Products deleted",
        description: `${selectedProductIds.length} products have been deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete products",
        description: error.message,
        variant: "destructive",
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
  
  // Loading state
  if (isProductsLoading || isCategoriesLoading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-xl font-medium">Loading products...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <CardTitle>Product Inventory</CardTitle>
            <div className="flex-1 md:flex-initial md:ml-4 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedProductIds.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center mb-4">
              <p className="text-sm text-gray-700">
                {selectedProductIds.length} {selectedProductIds.length === 1 ? 'product' : 'products'} selected
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the selected products. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2 text-left">
                      <Checkbox
                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                        checked={selectedProductIds.length === products.length}
                        indeterminate={selectedProductIds.length > 0 && selectedProductIds.length < products.length}
                      />
                    </th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Category</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Inventory</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="border-b">
                      <td className="py-3 px-2">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked === true)}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-3">
                            <img 
                              src={product.imageUrl || `https://via.placeholder.com/40?text=${encodeURIComponent(product.name.charAt(0))}`}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {product.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {categories.find((c: any) => c.id === product.categoryId)?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-2 text-sm font-medium">{formatPrice(product.price)}</td>
                      <td className="py-3 px-2 text-sm">{product.inventory}</td>
                      <td className="py-3 px-2">
                        {product.inventory === 0 ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>
                        ) : product.inventory < 10 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                        )}
                        
                        {product.featured && (
                          <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100">Featured</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the product. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
      
      {/* Product form dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the product details below'
                : 'Fill in the details to add a new product to your inventory'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="inventory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventory</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={isEditMode ? String(field.value) : categories.length > 0 ? String(categories[0].id) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input placeholder="Enter image URL" {...field} />
                          {field.value && (
                            <div className="ml-4 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={field.value}
                                alt="Product"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/40?text=Error`;
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the product image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Product</FormLabel>
                        <FormDescription>
                          This product will be displayed on the homepage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Product' : 'Add Product'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
