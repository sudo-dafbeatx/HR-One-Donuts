import BotOnatWidget from "@/components/BotOnatWidget";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Sistem | HR-One Donuts",
  description: "Live chat bantuan sistem dan teknis HR-One Donuts",
};

export default function SystemChatPage() {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
      <BotOnatWidget />
    </div>
  );
}
