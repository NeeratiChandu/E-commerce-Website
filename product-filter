import { Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CheckboxItem, CheckboxGroup } from "@radix-ui/react-checkbox";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Filter, X } from "lucide-react";

interface ProductFilterProps {
  categories: Category[];
  initialFilters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  onFilterChange: (filters: any) => void;
}

export function ProductFilter({ 
  categories, 
  initialFilters = {}, 
  onFilterChange 
}: ProductFilterProps) {
  const [location, navigate] = useLocation();
  const [filters, setFilters] = useState({
    categoryId: initialFilters.categoryId,
    search: initialFilters.search || "",
    minPrice: initialFilters.minPrice || 0,
    maxPrice: initialFilters.maxPrice || 1000,
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice, 
    filters.maxPrice
  ]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // Update the price range display when filters change
    setPriceRange([filters.minPrice, filters.maxPrice]);
  }, [filters.minPrice, filters.maxPrice]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (id: number, checked: boolean) => {
    setFilters({ 
      ...filters, 
      categoryId: checked ? id : undefined 
    });
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  const handlePriceApply = () => {
    setFilters({
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      categoryId: undefined,
      search: "",
      minPrice: 0,
      maxPrice: 1000
    };
    setFilters(clearedFilters);
    setPriceRange([0, 1000]);
    onFilterChange(clearedFilters);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      {/* Mobile filter dialog */}
      <div className="block lg:hidden mb-6">
        <Button 
          variant="outline" 
          className="w-full justify-center"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        
        {showMobileFilters && (
          <div className="fixed inset-0 flex z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileFilters(false)}></div>
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-4 px-4">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="mobile-search">Search</Label>
                    <Input
                      id="mobile-search"
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={handleSearchChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                    <div className="mt-2 space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox
                            id={`mobile-category-${category.id}`}
                            checked={filters.categoryId === category.id}
                            onCheckedChange={(checked) => 
                              handleCategoryChange(category.id, checked === true)
                            }
                          />
                          <label
                            htmlFor={`mobile-category-${category.id}`}
                            className="ml-2 text-sm text-gray-600"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                    <div className="mt-2">
                      <Slider
                        defaultValue={[0, 1000]}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                      />
                      <div className="mt-2 flex justify-between text-sm text-gray-500">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={handlePriceApply}
                      >
                        Apply Price
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button className="w-full" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block">
        <div className="space-y-6">
          <div>
            <Label htmlFor="desktop-search">Search</Label>
            <Input
              id="desktop-search"
              placeholder="Search products..."
              value={filters.search}
              onChange={handleSearchChange}
              className="mt-1"
            />
          </div>

          <Accordion type="single" collapsible defaultValue="categories">
            <AccordionItem value="categories">
              <AccordionTrigger className="text-sm font-medium text-gray-900">
                Categories
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`desktop-category-${category.id}`}
                        checked={filters.categoryId === category.id}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category.id, checked === true)
                        }
                      />
                      <label
                        htmlFor={`desktop-category-${category.id}`}
                        className="ml-2 text-sm text-gray-600"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
              <AccordionTrigger className="text-sm font-medium text-gray-900">
                Price Range
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2">
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                  />
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={handlePriceApply}
                  >
                    Apply Price
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-2">
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" className="w-full" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
