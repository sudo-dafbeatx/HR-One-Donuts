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
  display: "swap",
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
      <body
        className={`${plusJakartaSans.variable} antialiased font-sans bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-16 md:pb-0`}
      >
        <CartProvider>
          <TrafficTracker />
          {children}
          <CartDrawer />
          <BottomNav />
          
          {/* Global Accessibility Fix for Google Identity Services (One Tap) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
                        const target = mutation.target;
                        if (target.getAttribute('aria-hidden') === 'true' && (target.id === 'credential_picker_container' || target.classList.contains('google-one-tap'))) {
                          // Only remove if it's the known Google GSI container that causes focus conflicts
                          target.removeAttribute('aria-hidden');
                        }
                      }
                    });
                  });

                  observer.observe(document.body, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['aria-hidden']
                  });
                })();
              `
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
