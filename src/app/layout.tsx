import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { LoadingProvider } from "@/context/LoadingContext";
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

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = settingsData?.value as unknown as SiteSettings | undefined;

  return (
    <html lang="id" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} antialiased font-sans bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-16 md:pb-0`}
      >
        <LoadingProvider>
          <CartProvider>
            <TrafficTracker />
            {children}
            <CartDrawer siteSettings={siteSettings} />
            <BottomNav />
            
            {/* Global Accessibility Fix for Google Identity Services (One Tap) */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    const observer = new MutationObserver((mutations) => {
                      for (const mutation of mutations) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
                          const target = mutation.target;
                          const isGoogleContainer = target.id === 'credential_picker_container' || 
                                                target.classList.contains('google-one-tap') ||
                                                target.getAttribute('data-gsi-container') === 'true';
                          
                          if (isGoogleContainer && target.getAttribute('aria-hidden') === 'true') {
                            // Allow the attribute to be false/removed, but prevent 'true' from sticking
                            // if focus might be inside. Using requestAnimationFrame to let Google's script
                            // finish its internal work first.
                            requestAnimationFrame(() => {
                              if (target.getAttribute('aria-hidden') === 'true') {
                                target.removeAttribute('aria-hidden');
                              }
                            });
                          }
                        }
                      }
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
        </LoadingProvider>
      </body>
    </html>
  );
}
