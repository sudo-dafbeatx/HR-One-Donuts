"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setCartQuantity: (id: string, quantity: number) => void;
  totalItems: number;
  totalDonuts: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  clearCart: () => void;
  getEffectiveItemPrice: (item: CartItem) => number;
  priceTiers: { min: number; max?: number; price: number }[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("donut-cart");
    if (savedCart) {
      try {
        const timer = setTimeout(() => {
          setCart(JSON.parse(savedCart));
        }, 0);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("donut-cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevCart, { ...item, quantity }];
    });
    setIsCartOpen(true); // Open cart when item added
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const setCartQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemUnits = (name: string) => {
    // Robust check for "Isi X" or "Box X"
    const match = name.match(/(?:isi|box)\s+(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  };

  const totalDonuts = cart.reduce((sum, item) => sum + item.quantity * getItemUnits(item.name), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // New Tiered Pricing Logic:
  // 1-48: Rp 2,500
  // 49-60: Rp 2,000
  // >60: Rp 1,670
  const priceTiers = [
    { min: 1, max: 48, price: 2500 },
    { min: 49, max: 60, price: 2000 },
    { min: 61, price: 1670 }
  ];

  const getEffectiveItemPrice = (item: CartItem) => {
    const units = getItemUnits(item.name);
    // Determine the per-donut price based on total donuts in cart
    const tier = priceTiers.find(t => totalDonuts >= t.min && (!t.max || totalDonuts <= t.max));
    const perDonutPrice = tier ? tier.price : 2500; // Fallback to base price
    
    // Return the price for the whole item (e.g., Box price = 6 * perDonutPrice)
    return perDonutPrice * units;
  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + getEffectiveItemPrice(item) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCartQuantity,
        totalItems,
        totalDonuts,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        clearCart,
        getEffectiveItemPrice,
        priceTiers,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
