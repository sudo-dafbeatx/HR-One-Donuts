"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/cms";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  isAnimated?: boolean;
}

const TypewriterText = ({ 
  content, 
  onComplete, 
  isAnimated 
}: { 
  content: string; 
  onComplete: () => void;
  isAnimated?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(isAnimated ? content.length : 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAnimated) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= content.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          return prev;
        }
        return prev + 1;
      });
    }, 20); // Natural speed

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [content, onComplete, isAnimated]);

  const handleSkip = () => {
    if (isAnimated) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex(content.length);
    onComplete();
  };

  const displayText = content.slice(0, currentIndex);

  return (
    <div onClick={handleSkip} className="cursor-pointer select-none">
      <p className="text-sm whitespace-pre-line">{displayText}</p>
      {!isAnimated && currentIndex < content.length && (
        <span className="inline-block w-1.5 h-4 bg-primary/40 ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { cart, totalPrice } = useCart();
  const pathname = usePathname();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (content: string, quickReplies?: string[]) => {
    setIsTyping(false);
    const botMessage: Message = {
      id: crypto.randomUUID(),
      type: "bot",
      content,
      timestamp: new Date(),
      quickReplies,
      isAnimated: false,
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const markMessageAsAnimated = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isAnimated: true } : msg))
    );
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

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Load saved position
    const savedPos = localStorage.getItem("dona_chat_pos");
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {
        console.error("Failed to parse saved chat position", e);
      }
    }

    // First visit hint logic
    const hintSeen = localStorage.getItem("dona_hint_seen");
    if (!hintSeen) {
      const showTimer = setTimeout(() => setShowHint(true), 2000); // Show after 2s
      const hideTimer = setTimeout(() => setShowHint(false), 10000); // Auto hide hint after 10s
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  useEffect(() => {
    // Fetch products for real-time menu sync
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (!error && data) {
        setProducts(data as Product[]);
      }
    };
    fetchProducts();
  }, [supabase]);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem("dona_hint_seen", "true");
  };

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBotResponse = async (userInput: string) => {
    const input = userInput.toLowerCase();

    setIsTyping(true);

    // 1. Dynamic Menu / Product Search
    if (input.includes("menu") || input.includes("lihat menu") || input.includes("produk") || input.includes("bestseller") || input.includes("laris")) {
      setTimeout(() => {
        if (products.length === 0) {
          addBotMessage(
            "Maaf, sepertinya menu kami belum tersedia saat ini di sistem. 🍩\n\nSilakan cek kembali nanti atau hubungi kami via WhatsApp untuk informasi stok terbaru.",
            ["Hubungi WhatsApp", "Cara Pesan"]
          );
        } else {
          let menuText = "Berikut menu donat kami yang tersedia:\n\n";
          
          // If asking for bestseller, sort by sold_count if available
          const displayProducts = input.includes("bestseller") || input.includes("laris")
            ? [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 5)
            : products.slice(0, 8); // General list

          displayProducts.forEach((p) => {
            menuText += `🍩 ${p.name} - Rp ${p.price.toLocaleString("id-ID")}\n`;
          });

          if (products.length > displayProducts.length) {
            menuText += `\n...dan ${products.length - displayProducts.length} pilihan lainnya!`;
          }

          menuText += "\n\nIngin melihat katalog lengkap dengan gambar?";
          addBotMessage(menuText, ["Katalog Lengkap", "Hubungi WhatsApp"]);
        }
      }, 800);
      return;
    }

    if (input.includes("cara pesan")) {
      setTimeout(() => {
        window.location.href = "/cara-pesan";
        addBotMessage(
          "Mengarahkan Anda ke panduan cara pesan kami... 📖",
          ["Kembali"]
        );
      }, 800);
      return;
    }

    if (input.includes("whatsapp") || input.includes("wa") || input.includes("hubungi") || input.includes("kontak")) {
      setTimeout(() => {
        const phoneNumber = process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || "6285810658117";
        if (cart.length > 0) {
          const messageArr = ["Halo HR-One Donuts! 🍩 Saya ingin memesan:\n\n"];
          cart.forEach((item, index) => {
            messageArr.push(`${index + 1}. ${item.name}\n   Jumlah: ${item.quantity} pcs\n   Harga: Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n\n`);
          });
          messageArr.push(`*Total: Rp ${totalPrice.toLocaleString("id-ID")}*\n\nMohon konfirmasi ketersediaan. Terima kasih!`);
          const encodedMessage = encodeURIComponent(messageArr.join(""));
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
      }, 800);
      return;
    }

    // 2. Dynamic Search from Knowledge Base
    const { data: kbData, error } = await supabase
      .from("knowledge_base")
      .select("question, answer")
      .order("created_at", { ascending: false });

    if (!error && kbData) {
      // Simple keyword matching or fuzzy-ish match
      const matched = kbData.find((item: { question: string; answer: string }) => 
        input.includes(item.question.toLowerCase()) || 
        item.question.toLowerCase().includes(input)
      );

      if (matched) {
        setTimeout(() => {
          addBotMessage(matched.answer);
        }, 800);
        return;
      }
    }

    // 3. Fallback & Logging
    setTimeout(async () => {
      // Log the unanswered question
      await supabase.from("bot_questions_log").insert([{ question: userInput }]);
      
      addBotMessage(
        "Maaf, saya belum mengerti pertanyaan Anda 😅\n\nTim kami sudah mencatat pertanyaan ini untuk dipelajari lebih lanjut. Apa ada yang lain?",
        ["Lihat Menu", "Cara Pesan", "Hubungi WhatsApp", "Bestseller"]
      );
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    handleBotResponse(inputValue);
    setInputValue("");
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isOpen) return; 
    setIsDragging(true);
    if (showHint) dismissHint();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    let newX = clientX - dragStartPos.current.x;
    let newY = clientY - dragStartPos.current.y;
    
    const isMobile = window.innerWidth < 768;
    const padding = 20;
    const iconSize = isMobile ? 56 : 64;
    
    // Horizontal Limits (relative to right-6/right-8)
    // maxX = 0 (can't move right of initial position)
    // minX = -(screen - iconSize - padding)
    const maxX = 12; // Allow small nudge right
    const minX = -(window.innerWidth - iconSize - padding * 2);
    
    // Vertical Limits (relative to bottom-24/bottom-8)
    // For translate(y), moving UP is negative.
    // Initial: bottom-24 (96px). Navbar: 64px.
    // Safe bottom limit: stay at least at initial bottom.
    // maxY = how much it can move DOWN. Since initial is 96px, and navbar is 64px,
    // we can move down a bit but not too much.
    const maxY = isMobile ? 24 : 8; // Small buffer down
    const minY = -(window.innerHeight - iconSize - (isMobile ? 180 : 100)); // Limit how much it can move UP

    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem("dona_chat_pos", JSON.stringify(position));
    }
  }, [isDragging, position]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleQuickReply = (reply: string) => {
    if (reply === "Tutup Chat") {
      setIsOpen(false);
      return;
    }
    addUserMessage(reply);
    handleBotResponse(reply);
  };

  const hiddenRoutes = ['/admin', '/login', '/register', '/onboarding'];
  if (pathname && hiddenRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Button Container */}
      {!isOpen && (
        <div 
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 transition-transform duration-75 select-none touch-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          {/* Hint Bubble */}
          {showHint && (
            <div className="absolute bottom-full right-0 mb-4 animate-[bounce_2s_infinite] pointer-events-auto z-[99999] origin-bottom-right drop-shadow-2xl" style={{ width: 'max-content' }}>
              <div className="bg-white text-slate-800 px-4 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 whitespace-nowrap">
                <p className="text-sm font-bold">Butuh bantuan aku?</p>
                <button onClick={dismissHint} className="text-slate-400 hover:text-slate-600 p-1">
                  <XMarkIcon className="w-4 h-4" />
                </button>
                {/* Arrow */}
                <div className="absolute top-full right-6 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45 -translate-y-1.5"></div>
              </div>
            </div>
          )}

          <button
            ref={buttonRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onClick={() => {
              if (!isDragging) {
                setIsOpen(true);
                dismissHint();
              }
            }}
            style={{
              cursor: isDragging ? 'grabbing' : 'pointer'
            }}
            className="w-14 h-14 md:w-16 md:h-16 bg-linear-to-br from-primary to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group hover:rotate-6"
            aria-label="Chat dengan Dona AI"
          >
            <Image 
              src="/images/Dona.webp" 
              width={48} 
              height={48}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover group-hover:scale-110 transition-transform bg-white border-2 border-white shadow-inner" 
              alt="Dona"
              priority
            />
            
            {/* Badge for cart count or notification */}
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-[400px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-scale-in border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Image 
                  src="/images/Dona.webp" 
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border border-white/50 bg-white" 
                  alt="Dona"
                />
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
                  {message.type === "bot" ? (
                    <TypewriterText
                      content={message.content}
                      isAnimated={message.isAnimated}
                      onComplete={() => markMessageAsAnimated(message.id)}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  )}
                  
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
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 animate-pulse">
                      Bot Dona sedang mengetik...
                    </span>
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
