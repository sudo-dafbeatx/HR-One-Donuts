"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBagIcon, XMarkIcon, ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function CartDrawer() {
  const { cart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen, removeFromCart } = useCart();
  const [mounted] = useState(() => typeof window !== "undefined");

  if (!mounted) return null;

  const handleWhatsAppOrder = () => {
    const phone = "6281234567890"; // Example business phone
    let message = "Halo Donat Keluarga! 🍩 Saya ingin memesan:\n\n";
    
    cart.forEach((item) => {
      message += `✅ *${item.name}*\n   ${item.quantity}x @ Rp ${item.price.toLocaleString("id-ID")} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n\n`;
    });
    
    message += `-------------------\n`;
    message += `💰 *Total Estimasi: Rp ${totalPrice.toLocaleString("id-ID")}*\n\n`;
    message += `Mohon info rincian pengiriman dan pembayarannya ya. Terima kasih! 🙏`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <aside 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-background-dark shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-2 text-heading dark:text-white">
              <ShoppingBagIcon className="w-6 h-6 text-primary" />
              Pesanan Saya
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Family Business - Handcrafted with Love</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
              <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Keranjang masih kosong</p>
                <p className="text-sm text-slate-500 mt-1">Ayo cari donat favoritmu!</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                Lihat Katalog
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="relative w-20 h-20 rounded-lg border border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rp {item.price.toLocaleString("id-ID")} / pcs</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-primary font-bold hover:bg-primary/20 rounded-md transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-primary font-bold hover:bg-primary/20 rounded-md transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-semibold">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Total Estimasi</span>
                <span className="text-2xl font-extrabold text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl py-4 flex flex-col items-center justify-center gap-1 transition-all shadow-lg shadow-[#25D366]/20 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 font-bold text-lg">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.852.448-1.271.607-1.445.159-.173.346-.217.462-.217h.332c.101 0 .23.036.332.274.116.273.39.954.423 1.025.033.072.054.156.007.251-.047.094-.072.156-.144.239-.072.083-.151.185-.216.249-.072.072-.147.151-.063.294.083.144.368.607.789.982.541.483 1.002.632 1.144.704.144.072.23.063.315-.033.085-.097.368-.427.466-.572.101-.144.202-.123.332-.076.13.047.823.39.966.462.144.072.239.108.274.17.036.062.036.357-.108.762zM12 1a10.89 10.89 0 00-11 11c0 2.187.625 4.22 1.707 5.956L1 23l5.241-1.374A10.84 10.84 0 0012 23c6.075 0 11-4.925 11-11S18.075 1 12 1z"/>
                </svg>
                Pesan via WhatsApp
              </div>
              <span className="text-[10px] uppercase tracking-wider opacity-90 font-medium">Kirim rincian pesanan otomatis</span>
            </button>
            <p className="mt-4 text-[10px] text-center text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">
              Layanan Pickup & Delivery Jakarta Area Only
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
