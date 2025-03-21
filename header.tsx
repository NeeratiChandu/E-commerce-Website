import { Link, useLocation } from "wouter";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User, Package, Search, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <Container>
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary-700 rounded-md flex items-center justify-center text-white font-bold mr-2">
                <ShoppingCart size={18} />
              </div>
              <Link href="/">
                <span className="text-xl font-semibold text-primary-700 cursor-pointer">ShopSmart</span>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === link.href 
                      ? "border-primary-500 text-primary-700" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}>
                    {link.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="mr-4 relative">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-64 focus-visible:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search size={18} />
              </Button>
            </form>

            <Link href="/cart">
              <Button variant="ghost" className="mr-2 relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-primary-700 text-white">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User size={18} />
                    <span className="hidden md:inline">{user.name || user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Cart</span>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")} className="flex items-center gap-2">
                <LogIn size={18} />
                <span>Login</span>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Link href="/cart">
              <Button variant="ghost" className="mr-2 relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-primary-700 text-white">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button variant="ghost" onClick={toggleMobileMenu}>
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <form onSubmit={handleSearch} className="mb-4 mt-2 relative">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full focus-visible:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search size={18} />
              </Button>
            </form>

            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === link.href 
                    ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700" 
                    : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  {link.name}
                </a>
              </Link>
            ))}

            {user ? (
              <>
                <Link href="/profile">
                  <a className="block px-3 py-2 rounded-md text-base font-medium border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">
                    Profile
                  </a>
                </Link>
                {user.isAdmin && (
                  <Link href="/admin">
                    <a className="block px-3 py-2 rounded-md text-base font-medium border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">
                      Admin Dashboard
                    </a>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <a className="block px-3 py-2 rounded-md text-base font-medium bg-primary-50 border-l-4 border-primary-500 text-primary-700">
                  Login / Register
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
