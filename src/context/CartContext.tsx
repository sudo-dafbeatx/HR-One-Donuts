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
    const tier = priceTiers.find(t => totalItems >= t.min && (!t.max || totalItems <= t.max));
    return tier ? tier.price : item.price;
  };

  const totalPrice = cart.reduce((sum, item) => {
    const effectivePrice = getEffectiveItemPrice(item);
    return sum + effectivePrice * item.quantity;
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
