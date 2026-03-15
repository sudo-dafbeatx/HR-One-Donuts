"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Voucher } from "@/app/actions/voucher-actions";

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
  activeVoucher: Voucher | null;
  applyVoucher: (voucher: Voucher | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);

  // Load cart and promo from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("donut-cart");
    const savedPromo = localStorage.getItem("donut-active-voucher");
    
    if (savedCart) {
      try {
        const timer = setTimeout(() => {
          setCart(JSON.parse(savedCart));
          if (savedPromo) {
             setActiveVoucher(JSON.parse(savedPromo));
          }
        }, 0);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Failed to parse cart/promo from localStorage", e);
      }
    }
  }, []);

  // Save cart and promo to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("donut-cart", JSON.stringify(cart));
      if (activeVoucher !== null) {
        localStorage.setItem("donut-active-voucher", JSON.stringify(activeVoucher));
      } else {
        localStorage.removeItem("donut-active-voucher");
      }
    }
  }, [cart, activeVoucher]);

  const applyVoucher = (voucher: Voucher | null) => {
    setActiveVoucher(voucher);
  };

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

  const totalPrice = (() => {
    const baseTotal = cart.reduce((sum, item) => {
      return sum + getEffectiveItemPrice(item) * item.quantity;
    }, 0);

    // Dynamic Promo Logic with activeVoucher
    if (activeVoucher) {
      // Check min purchase
      if (baseTotal < activeVoucher.min_purchase) {
        return baseTotal; // fallback if somehow cart drops below min
      }

      let totalDiscount = 0;
      
      if (activeVoucher.discount_type === 'percentage') {
        totalDiscount = baseTotal * (activeVoucher.discount_value / 100);
      } else if (activeVoucher.discount_type === 'fixed') {
        totalDiscount = activeVoucher.discount_value;
      }

      // Check max discount
      if (activeVoucher.max_discount && totalDiscount > activeVoucher.max_discount) {
        totalDiscount = activeVoucher.max_discount;
      }

      return Math.max(0, baseTotal - Math.round(totalDiscount));
    }

    return baseTotal;
  })();

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
        activeVoucher,
        applyVoucher,
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
