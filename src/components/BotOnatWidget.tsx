"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

export default function BotOnatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "Halo! 👋 Saya Onat, Tim Teknis & CS Sistem HR-One.\n\nAda kendala login, akun, pengiriman, atau error teknis yang bisa saya bantu periksa?",
          ["Lupa Password", "Lacak Pesanan", "Ganti Akun", "Kendala Teknis"]
        );
      }, 500);
    }
  }, [messages.length]);

  const handleBotResponse = async (userInput: string) => {
    const input = userInput.toLowerCase();
    setIsTyping(true);

    const { data: kbData, error } = await supabase
      .from("knowledge_base")
      .select("question, answer")
      .order("created_at", { ascending: false });

    if (!error && kbData) {
      const matched = kbData.find((item: { question: string; answer: string }) => 
        input.includes(item.question.toLowerCase()) || 
        item.question.toLowerCase().includes(input)
      );

      if (matched) {
        setTimeout(() => {
          const answer = `${matched.answer}`;
          addBotMessage(answer);
        }, 800);
        return;
      }
    }

    setTimeout(async () => {
      // Log the unanswered question
      await supabase.from("bot_questions_log").insert([{ question: userInput }]);
      
      addBotMessage(
        "Maaf, solusi untuk kendala sistem tersebut belum saya pahami. 😅\n\nTim IT kami sudah mencatat isu ini. Untuk bantuan darurat, silakan email ke halo@hrone.com atau kontak WhatsApp CS kami.",
        ["Kontak WA Darurat", "Kembali"]
      );
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Check if handling Darurat specific intent
    if (inputValue === "Kontak WA Darurat") {
      addUserMessage(inputValue);
      setTimeout(() => {
        const phoneNumber = process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || "62895351251395";
        const message = encodeURIComponent("Halo Tim CS/Teknis HR-One Donut 👋 Saya ingin melaporkan kendala teknis/sistem.");
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
        addBotMessage("Mengarahkan Anda ke WhatsApp Customer Support...");
        setIsTyping(false);
      }, 500);
      setInputValue("");
      return;
    }
    
    // Check if returning from previous action
    if (inputValue === "Kembali") {
      addUserMessage(inputValue);
      setTimeout(() => {
         addBotMessage("Ada kendala teknis lain yang bisa Onat bantu?", ["Lupa Password", "Kendala Teknis"]);
      }, 500);
      setInputValue("");
      return;
    }

    addUserMessage(inputValue);
    handleBotResponse(inputValue);
    setInputValue("");
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    // Use timeout to allow state to update before triggering send
    setTimeout(() => {
      const input = document.getElementById('onat-chat-input');
      if (input) {
         input.focus();
         // Programmatically trigger send
         addUserMessage(reply);
         handleBotResponse(reply);
         setInputValue("");
      }
    }, 0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-slate-50 max-w-3xl mx-auto border-x border-slate-200 shadow-sm relative z-40">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 md:px-6 py-4 flex items-center justify-between shadow-xs z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors md:hidden"
            aria-label="Kembali"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center p-0.5 border border-white/20">
            <Image 
              src="/images/Onat.webp" 
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover bg-slate-800" 
              alt="Onat"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Onat</h3>
            <p className="text-xs text-white/70 font-medium">Sistem & Keluhan CS</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 flex flex-col scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs ${
                message.type === "user"
                  ? "bg-slate-800 text-white rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
              }`}
            >
              {message.type === "bot" ? (
                <TypewriterText
                  content={message.content}
                  isAnimated={message.isAnimated}
                  onComplete={() => markMessageAsAnimated(message.id)}
                />
              ) : (
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              )}
              
              {/* Quick Replies */}
              {message.type === "bot" && message.quickReplies && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-50">
                  {message.quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuickReply(reply);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors active:scale-95"
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
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs inline-block">
              <div className="flex items-center gap-2 pr-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span className="text-xs font-medium text-slate-400 ml-1">
                  Onat mengetik...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty space at bottom so last message isn't hidden by input */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 pb-sanitizer">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            id="onat-chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Tanyakan masalah login, error..."
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white text-sm font-medium transition-all"
            autoComplete="off"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="w-[52px] h-[52px] shrink-0 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md"
            aria-label="Kirim pesan"
          >
            <PaperAirplaneIcon className="w-5 h-5 -ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
