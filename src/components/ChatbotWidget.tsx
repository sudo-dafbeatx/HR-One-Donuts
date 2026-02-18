"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { cart, totalPrice } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (content: string, quickReplies?: string[]) => {
    const botMessage: Message = {
      id: crypto.randomUUID(),
      type: "bot",
      content,
      timestamp: new Date(),
      quickReplies,
    };
    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message when chat opens
      setTimeout(() => {
        addBotMessage(
          "Halo! 👋 Saya Dona, AI Assistant HR-One Donuts \n\nSaya siap membantu Anda! Mau lihat menu atau ada pertanyaan?",
          ["Lihat Menu", "Cara Pesan", "Hubungi WhatsApp", "Bestseller"]
        );
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleBotResponse = (userInput: string) => {
    const input = userInput.toLowerCase();

    setIsTyping(true);

    setTimeout(() => {
      // Product queries
      if (input.includes("menu") || input.includes("lihat menu") || input.includes("produk")) {
        addBotMessage(
          "Berikut menu donat kami:\n\n🍩 Classic Glazed - Rp 12.000\n🍫 Chocolate Dream - Rp 15.000\n🍪 Lotus Biscoff - Rp 18.000\n🍓 Strawberry Sparkle - Rp 15.000\n🥜 Pistachio Perfection - Rp 22.000\n\nIngin melihat katalog lengkap?",
          ["Katalog Lengkap", "Cara Pesan"]
        );
      }
      // Bestseller query
      else if (input.includes("bestseller") || input.includes("terlaris") || input.includes("favorit")) {
        addBotMessage(
          "Donat bestseller kami adalah:\n\n⭐ Classic Glazed - Rp 12.000\n⭐ Chocolate Dream - Rp 15.000\n⭐ Lotus Biscoff - Rp 18.000\n\nSemuanya dibuat fresh setiap hari! Mau pesan yang mana?",
          ["Pesan Sekarang", "Lihat Menu"]
        );
      }
      // Ordering process
      else if (input.includes("cara pesan")) {
        window.location.href = "/cara-pesan";
        addBotMessage(
          "Mengarahkan Anda ke panduan cara pesan kami... 📖",
          ["Kembali"]
        );
      }
      else if (input.includes("pesan") || input.includes("order") || input.includes("beli")) {
        addBotMessage(
          "Cara pesan sangat mudah! 🎯\n\n1. Lihat menu di katalog kami\n2. Pilih donat favorit Anda\n3. Tambahkan ke keranjang\n4. Lakukan checkout & pembayaran\n\nIngin melihat panduan lengkapnya?",
          ["Cara Pesan", "Katalog Lengkap"]
        );
      }
      // WhatsApp contact
      else if (input.includes("whatsapp") || input.includes("wa") || input.includes("hubungi") || input.includes("kontak")) {
        const phoneNumber = "6285810658117";
        if (cart.length > 0) {
          // If there's cart, generate order message
          let message = "Halo HR-One Donuts! 🍩 Saya ingin memesan:\n\n";
          cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n   Jumlah: ${item.quantity} pcs\n   Harga: Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n\n`;
          });
          message += `*Total: Rp ${totalPrice.toLocaleString("id-ID")}*\n\nMohon konfirmasi ketersediaan. Terima kasih!`;
          
          const encodedMessage = encodeURIComponent(message);
          window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
          
          addBotMessage(
            "Saya sudah buatkan pesan dengan detail pesanan Anda di WhatsApp! 📱\n\nSilakan konfirmasi pesanan dengan tim kami. Ada yang bisa saya bantu lagi?",
            ["Lihat Menu", "Selesai"]
          );
        } else {
          const message = encodeURIComponent("Halo HR-One Donuts! 👋\n\nSaya tertarik untuk memesan donat. Boleh info lebih lanjut?");
          window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
          
          addBotMessage(
            "Saya sudah hubungkan Anda ke WhatsApp kami! 📱\n\nTim kami akan segera membantu Anda. Ada yang lain?",
            ["Lihat Menu", "Selesai"]
          );
        }
      }
      // Catalog link
      else if (input.includes("katalog")) {
        window.location.href = "/catalog";
        addBotMessage(
          "Mengarahkan Anda ke katalog lengkap... 📖",
          ["Kembali"]
        );
      }
      // Closing/thank you
      else if (input.includes("selesai") || input.includes("terima kasih") || input.includes("thanks")) {
        addBotMessage(
          "Sama-sama! 😊 Senang bisa membantu Anda.\n\nJika butuh bantuan lagi, jangan ragu untuk chat saya ya! 🍩",
          ["Lihat Menu", "Tutup Chat"]
        );
      }
      // Default response
      else {
        addBotMessage(
          "Maaf, saya belum mengerti pertanyaan Anda 😅\n\nApa yang bisa saya bantu?",
          ["Lihat Menu", "Cara Pesan", "Hubungi WhatsApp", "Bestseller"]
        );
      }
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    handleBotResponse(inputValue);
    setInputValue("");
  };

  const handleQuickReply = (reply: string) => {
    if (reply === "Tutup Chat") {
      setIsOpen(false);
      return;
    }
    addUserMessage(reply);
    handleBotResponse(reply);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 z-50 group hover:animate-none"
          aria-label="Chat dengan Dona AI"
        >
          <SparklesIcon className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          
          {/* Badge for cart count or notification */}
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-[400px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-scale-in border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Dona</h3>
                <p className="text-xs text-white/80">AI Assistant Donat Kami</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  
                  {/* Quick Replies */}
                  {message.type === "bot" && message.quickReplies && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-full transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
