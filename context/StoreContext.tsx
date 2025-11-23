import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User, Role, Order, OrderStatus, Address, Review, PaymentStatus, Coupon, Notification } from '../types';
import { dbService, seedDatabase } from '../services/db';

interface StoreContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;

  user: User | null;
  allUsers: User[];
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  
  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;

  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status' | 'userId' | 'timeline' | 'paymentStatus'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  refundOrder: (orderId: string) => void;
  
  // Coupons
  coupons: Coupon[];
  validateCoupon: (code: string, orderTotal: number) => Coupon | null;

  // Notifications
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;

  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Initialization ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await seedDatabase();
        await refreshData();
        
        // Load cart from local storage
        const savedCart = localStorage.getItem('lumina_cart');
        if (savedCart) setCart(JSON.parse(savedCart));

        // Load logged in user from local storage
        const savedUserId = localStorage.getItem('lumina_user_id');
        if (savedUserId) {
             const users = await dbService.getAllUsers();
             const found = users.find(u => u.id === savedUserId);
             if (found) setUser(found);
        }

      } catch (err) {
        console.error("Failed to initialize DB:", err);
        addNotification('error', 'Failed to load data from database.');
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
  }, [cart]);

  const refreshData = async () => {
      const [fetchedProducts, fetchedUsers, fetchedOrders, fetchedCoupons] = await Promise.all([
          dbService.getAllProducts(),
          dbService.getAllUsers(),
          dbService.getAllOrders(),
          dbService.getAllCoupons()
      ]);
      setProducts(fetchedProducts);
      setAllUsers(fetchedUsers);
      setOrders(fetchedOrders);
      setCoupons(fetchedCoupons);
  };

  // --- Notifications ---
  const addNotification = (type: Notification['type'], message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Product Actions ---
  const addProduct = async (product: Product) => {
    await dbService.saveProduct(product);
    setProducts(prev => [product, ...prev]);
    addNotification('success', 'Product added successfully');
  };

  const updateProduct = async (updatedProduct: Product) => {
    await dbService.saveProduct(updatedProduct);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addNotification('success', 'Product updated successfully');
  };

  const deleteProduct = async (productId: string) => {
    await dbService.deleteProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    addNotification('info', 'Product deleted');
  };

  const addReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newReview: Review = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        date: new Date().toISOString()
    };
    
    const updatedReviewsList = [newReview, ...(product.reviewsList || [])];
    const newCount = updatedReviewsList.length;
    const totalRating = updatedReviewsList.reduce((sum, r) => sum + r.rating, 0);
    const newRating = newCount > 0 ? totalRating / newCount : product.rating;

    const updatedProduct = {
        ...product,
        reviewsList: updatedReviewsList,
        reviews: newCount,
        rating: parseFloat(newRating.toFixed(1))
    };

    await updateProduct(updatedProduct);
    addNotification('success', 'Review submitted!');
  };

  // --- Cart Actions ---
  const addToCart = (product: Product) => {
    const currentItem = cart.find(item => item.id === product.id);
    const currentQty = currentItem ? currentItem.quantity : 0;
    
    if (currentQty + 1 > product.stock) {
      addNotification('error', `Only ${product.stock} items available in stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    addNotification('success', `Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const product = products.find(p => p.id === productId);
        const maxStock = product ? product.stock : 99;
        const newQty = Math.min(maxStock, Math.max(1, item.quantity + delta));
        
        if (item.quantity + delta > maxStock) {
           addNotification('error', `Cannot add more. Only ${maxStock} in stock.`);
           return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // --- Auth Actions ---
  const login = async (email: string, password?: string): Promise<boolean> => {
    // Refresh users from DB to ensure we have latest
    const currentUsers = await dbService.getAllUsers();
    setAllUsers(currentUsers);
    
    const targetUser = currentUsers.find(u => u.email === email && (!password || u.password === password));
    
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('lumina_user_id', targetUser.id);
      addNotification('success', `Welcome back, ${targetUser.name}`);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      addresses: [],
      wishlist: []
    };
    await dbService.saveUser(newUser);
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('lumina_user_id', newUser.id);
    addNotification('success', 'Account created successfully!');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumina_user_id');
    setIsCartOpen(false);
    addNotification('info', 'You have been logged out');
  };

  const addUser = async (newUser: User) => {
    await dbService.saveUser(newUser);
    setAllUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
    await dbService.saveUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser);
    }
    addNotification('success', 'Profile updated');
  };

  const deleteUser = async (userId: string) => {
    await dbService.deleteUser(userId);
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    if (user && user.id === userId) {
      logout();
    }
  };

  // --- Wishlist ---
  const toggleWishlist = async (productId: string) => {
    if (!user) {
        addNotification('error', 'Please login to use wishlist');
        return;
    }
    const exists = user.wishlist.includes(productId);
    let newWishlist;
    if (exists) {
        newWishlist = user.wishlist.filter(id => id !== productId);
        addNotification('info', 'Removed from wishlist');
    } else {
        newWishlist = [...user.wishlist, productId];
        addNotification('success', 'Added to wishlist');
    }
    const updatedUser = { ...user, wishlist: newWishlist };
    await updateUser(updatedUser);
  };

  const isInWishlist = (productId: string) => {
      return user ? user.wishlist.includes(productId) : false;
  };

  // --- Address Actions ---
  const addAddress = async (address: Address) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      addresses: [...user.addresses, address]
    };
    await updateUser(updatedUser);
  };

  const removeAddress = async (addressId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      addresses: user.addresses.filter(a => a.id !== addressId)
    };
    await updateUser(updatedUser);
  };

  // --- Coupons ---
  const validateCoupon = (code: string, orderTotal: number): Coupon | null => {
      const coupon = coupons.find(c => c.code === code);
      if (!coupon) return null;
      if (coupon.minOrder && orderTotal < coupon.minOrder) return null;
      return coupon;
  };

  // --- Order Actions ---
  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status' | 'userId' | 'timeline' | 'paymentStatus'>) => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      userId: user?.id || 'guest',
      date: now,
      status: 'pending',
      paymentStatus: 'paid', // Assuming simulation always succeeds for simplicity of the 'place' action
      timeline: {
        placed: now
      }
    };
    
    // Save order
    await dbService.saveOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);

    // Decrease stock for items
    const productUpdates = products.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
    });

    // We only want to update db for changed products to be efficient, but for now simple loop is fine
    for (const p of productUpdates) {
        if (p.stock !== products.find(prod => prod.id === p.id)?.stock) {
            await dbService.saveProduct(p);
        }
    }
    setProducts(productUpdates);
    
    clearCart();
    addNotification('email', `Order Confirmation sent to ${orderData.email}`);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date().toISOString();
    const updatedOrder = { 
        ...order, 
        status,
        timeline: {
          ...order.timeline,
          [status]: now
        }
    };
    
    if (status === 'shipped' && order.status !== 'shipped') {
        addNotification('email', `Shipping Update sent to ${order.email}`);
    }

    await dbService.saveOrder(updatedOrder);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    addNotification('success', `Order #${orderId} marked as ${status}`);
  };

  const refundOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date().toISOString();
    const updatedOrder: Order = {
        ...order,
        status: 'cancelled',
        paymentStatus: 'refunded',
        timeline: {
          ...order.timeline,
          refunded: now,
          cancelled: now
        }
    };

    await dbService.saveOrder(updatedOrder);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    
    addNotification('email', `Refund Confirmation sent to ${order.email}`);
    addNotification('success', `Order #${orderId} refunded`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      addReview,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      user,
      allUsers,
      login,
      register,
      logout,
      addUser,
      updateUser,
      deleteUser,
      toggleWishlist,
      isInWishlist,
      addAddress,
      removeAddress,
      orders,
      placeOrder,
      updateOrderStatus,
      refundOrder,
      coupons,
      validateCoupon,
      notifications,
      addNotification,
      removeNotification,
      isLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};