import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Product, CartItem, Notification, ProductCategory } from '../types';

interface StoreContextType {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  notifications: Notification[];
  login: (email: string, password: string) => boolean; // Returns success status
  register: (name: string, email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'sellerId'>) => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  placeOrder: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('flora_users_db');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize with empty array if no local storage exists, removing hardcoded mock data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('flora_products');
    return saved ? JSON.parse(saved) : []; 
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('flora_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('flora_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => {
    if (user) localStorage.setItem('flora_user', JSON.stringify(user));
    else localStorage.removeItem('flora_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('flora_users_db', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('flora_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('flora_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('flora_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Actions
  const login = (email: string, password: string): boolean => {
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string, role: UserRole): boolean => {
    if (registeredUsers.some(u => u.email === email)) {
      return false; // Email exists
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      password // Storing for mock auth
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const addProduct = (newProductData: Omit<Product, 'id' | 'sellerId'>) => {
    if (!user || user.role !== UserRole.SELLER) return;
    
    const newProduct: Product = {
      ...newProductData,
      id: Math.random().toString(36).substr(2, 9),
      sellerId: user.id
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantityOrdered: Math.min(item.quantityOrdered + quantity, product.quantityAvailable) }
            : item
        );
      }
      return [...prev, { ...product, quantityOrdered: quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const placeOrder = () => {
    if (!user) return;
    
    // Create notifications for sellers
    const newNotifications: Notification[] = cart.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      sellerId: item.sellerId,
      buyerName: user.name,
      productName: item.name,
      quantity: item.quantityOrdered,
      totalPrice: item.price * item.quantityOrdered,
      date: new Date().toLocaleDateString()
    }));

    // Decrease product quantity in global store
    const updatedProducts = products.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) {
            return { ...p, quantityAvailable: Math.max(0, p.quantityAvailable - cartItem.quantityOrdered) };
        }
        return p;
    });

    setProducts(updatedProducts);
    setNotifications(prev => [...prev, ...newNotifications]);
    setCart([]); // Clear cart
  };

  return (
    <StoreContext.Provider value={{ 
      user, 
      products, 
      cart, 
      notifications, 
      login, 
      register,
      logout, 
      addProduct, 
      addToCart, 
      removeFromCart, 
      placeOrder
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
