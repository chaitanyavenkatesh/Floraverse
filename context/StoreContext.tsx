import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Product, CartItem, Notification, ProductCategory } from '../types';

interface StoreContextType {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'sellerId'>) => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  placeOrder: () => Promise<void>;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('flora_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from MongoDB API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prodRes, notifRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/notifications')
        ]);
        
        if (prodRes.ok) setProducts(await prodRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch (error) {
        console.error("Failed to fetch data from API", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Persistence Effects for local-only state (user session & cart)
  useEffect(() => {
    if (user) localStorage.setItem('flora_user', JSON.stringify(user));
    else localStorage.removeItem('flora_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('flora_cart', JSON.stringify(cart));
  }, [cart]);

  // Actions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const addProduct = async (newProductData: Omit<Product, 'id' | 'sellerId'>) => {
    if (!user || user.role !== UserRole.SELLER) return;
    
    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newProductData,
                sellerId: user.id
            })
        });
        if (res.ok) {
            const savedProduct = await res.json();
            setProducts(prev => [...prev, savedProduct]);
        }
    } catch (e) {
        console.error("Failed to add product");
    }
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

  const placeOrder = async () => {
    if (!user) return;
    
    const newNotifications = cart.map(item => ({
      sellerId: item.sellerId,
      buyerName: user.name,
      productName: item.name,
      quantity: item.quantityOrdered,
      totalPrice: item.price * item.quantityOrdered,
      date: new Date().toLocaleDateString()
    }));

    try {
        // Send notifications
        const notifRes = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNotifications)
        });
        
        if (notifRes.ok) {
            const savedNotifications = await notifRes.json();
            setNotifications(prev => [...prev, ...savedNotifications]);
            
            // Update product quantities in backend
            await Promise.all(cart.map(async (item) => {
                const updatedQty = Math.max(0, item.quantityAvailable - item.quantityOrdered);
                await fetch(`/api/products/${item.id}/quantity`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantityAvailable: updatedQty })
                });
            }));
            
            // Refetch products to get latest state
            const prodRes = await fetch('/api/products');
            if (prodRes.ok) {
                setProducts(await prodRes.json());
            }

            setCart([]); // Clear cart
        }
    } catch (e) {
        console.error("Order placement failed");
    }
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
      placeOrder,
      isLoading
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
