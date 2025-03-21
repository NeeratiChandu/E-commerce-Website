import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilter } from "@/components/products/product-filter";
import { Separator } from "@/components/ui/separator";

export default function ProductsPage() {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    categoryId: undefined as number | undefined,
    search: "",
    minPrice: 0,
    maxPrice: 1000,
  });
  
  // Extract search query from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [location]);
  
  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Fetch products with filters
  const {
    data: products = [],
    isLoading: isProductsLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/products", filters],
    queryFn: async ({ queryKey }) => {
      const [_, currentFilters] = queryKey;
      const params = new URLSearchParams();
      
      if (currentFilters.categoryId) {
        params.append("categoryId", currentFilters.categoryId.toString());
      }
      
      if (currentFilters.search) {
        params.append("search", currentFilters.search);
      }
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      return response.json();
    },
  });
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-6">
        All Products
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter sidebar */}
        <div className="lg:col-span-1">
          <ProductFilter 
            categories={categories} 
            initialFilters={filters}
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        {/* Product grid */}
        <div className="lg:col-span-3">
          {/* Active filters */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              
              {filters.search && (
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span className="font-medium mr-1">Search:</span>
                  <span>{filters.search}</span>
                </div>
              )}
              
              {filters.categoryId !== undefined && (
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span className="font-medium mr-1">Category:</span>
                  <span>
                    {categories.find(c => c.id === filters.categoryId)?.name || 'Unknown'}
                  </span>
                </div>
              )}
              
              {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span className="font-medium mr-1">Price:</span>
                  <span>
                    ${filters.minPrice} - ${filters.maxPrice}
                  </span>
                </div>
              )}
              
              {(filters.search || filters.categoryId !== undefined || filters.minPrice > 0 || filters.maxPrice < 1000) && (
                <button 
                  onClick={() => handleFilterChange({
                    categoryId: undefined,
                    search: "",
                    minPrice: 0,
                    maxPrice: 1000
                  })}
                  className="text-sm text-primary-700 hover:text-primary-800"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <Separator className="mb-6" />
          
          {/* Products */}
          <ProductGrid products={products} isLoading={isProductsLoading} />
        </div>
      </div>
    </Container>
  );
}
