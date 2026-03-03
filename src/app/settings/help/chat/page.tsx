import HROneSupportWidget from "@/components/HROneSupportWidget";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Sistem | HR-One Donuts",
  description: "Live chat bantuan sistem dan teknis HR-One Donuts",
};

export default function SystemChatPage() {
  return (
    <div className="bg-slate-50 h-screen overflow-hidden">
      <HROneSupportWidget />
    </div>
  );
}
