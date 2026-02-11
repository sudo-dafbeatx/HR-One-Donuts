import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import TrafficTracker from "@/components/tracking/TrafficTracker";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HR-One Donuts - Resep Tradisional, Rasa Internasional",
  description: "Hadirkan kebahagiaan di setiap gigitan dengan donat artisan buatan keluarga kami yang lembut dan kaya rasa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body
        className={`${plusJakartaSans.variable} antialiased font-sans bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-16 md:pb-0`}
      >
        <CartProvider>
          <TrafficTracker />
          {children}
          <CartDrawer />
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
