import { users, products, categories, orders, orderItems, cartItems } from "@shared/schema";
import type { 
  User, InsertUser, 
  Product, InsertProduct, 
  Category, InsertCategory,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  CartItem, InsertCartItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: { 
    categoryId?: number; 
    search?: string;
    featured?: boolean;
  }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order operations
  getOrders(userId?: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, userId: number, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined>;
  addToCart(userId: number, productId: number, quantity: number): Promise<CartItem>;
  updateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: number, productId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  
  sessionStore: session.SessionStore;
  
  // ID counters
  private userId: number;
  private categoryId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;
  private cartItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.cartItemId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with some default data
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Add default admin user
    const adminUser: User = {
      id: this.userId++,
      username: "admin",
      password: "admin123", // In production, this would be hashed
      email: "admin@shopsmart.com",
      name: "Admin User",
      isAdmin: true,
      address: null,
      phone: null
    };
    this.users.set(adminUser.id, adminUser);
    
    // Add some default categories
    const categories = [
      { name: "Electronics", slug: "electronics" },
      { name: "Clothing", slug: "clothing" },
      { name: "Home", slug: "home" },
      { name: "Beauty", slug: "beauty" },
      { name: "Sports", slug: "sports" }
    ];
    
    categories.forEach(cat => {
      const category: Category = {
        id: this.categoryId++,
        name: cat.name,
        slug: cat.slug
      };
      this.categories.set(category.id, category);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const { confirmPassword, ...userData } = insertUser; // Remove confirmPassword
    const user: User = { 
      ...userData, 
      id,
      isAdmin: false,
      address: null,
      phone: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Product operations
  async getProducts(filters?: { categoryId?: number; search?: string; featured?: boolean }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      if (filters.categoryId) {
        products = products.filter(product => product.categoryId === filters.categoryId);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) || 
          (product.description && product.description.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters.featured !== undefined) {
        products = products.filter(product => product.featured === filters.featured);
      }
    }
    
    return products;
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(product => product.featured);
    
    if (limit) {
      products = products.slice(0, limit);
    }
    
    return products;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      ...product, 
      id,
      createdAt: new Date() 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProductById(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Order operations
  async getOrders(userId?: number): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    
    return orders;
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(orderData: InsertOrder, userId: number, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const order: Order = { 
      ...orderData, 
      id,
      userId,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    
    // Create order items
    items.forEach(item => {
      const orderItem: OrderItem = {
        ...item,
        id: this.orderItemId++,
        orderId: id
      };
      this.orderItems.set(orderItem.id, orderItem);
    });
    
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
  }
  
  async getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
  }
  
  async addToCart(userId: number, productId: number, quantity: number): Promise<CartItem> {
    // Check if item already in cart
    const existingItem = await this.getCartItemByProductId(userId, productId);
    
    if (existingItem) {
      return this.updateCartItem(userId, productId, existingItem.quantity + quantity) as Promise<CartItem>;
    }
    
    // Add new item
    const id = this.cartItemId++;
    const cartItem: CartItem = { id, userId, productId, quantity };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem | undefined> {
    const item = await this.getCartItemByProductId(userId, productId);
    if (!item) return undefined;
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(item.id, updatedItem);
    return updatedItem;
  }
  
  async removeFromCart(userId: number, productId: number): Promise<boolean> {
    const item = await this.getCartItemByProductId(userId, productId);
    if (!item) return false;
    
    return this.cartItems.delete(item.id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const userItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
      
    userItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }
}

export const storage = new MemStorage();
