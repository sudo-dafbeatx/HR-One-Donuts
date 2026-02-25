import '@/lib/env-check';
export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { ErrorPopupProvider } from "@/context/ErrorPopupContext";
import CartDrawer from "@/components/cart/CartDrawer";
import TrafficTracker from "@/components/tracking/TrafficTracker";
import BottomNav from "@/components/BottomNav";
import ThemeProvider from "@/components/ThemeProvider";
import { SiteSettings } from "@/types/cms";
import { getTheme, getCopy } from "@/lib/theme";
import { EditModeProvider } from "@/context/EditModeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import EditModeToggle from "@/components/cms/EditModeToggle";
import ThemePanel from "@/components/cms/ThemePanel";
import ScrollToTop from "@/components/utils/ScrollToTop";
import DelayedCardPopup from "@/components/DelayedCardPopup";
import { sourGummy } from "@/lib/fonts";
import ChatbotWidget from "@/components/ChatbotWidget";
import { createPublicServerSupabaseClient } from "@/lib/supabase/server";
import "./globals.css";

// Font definition moved to lib/fonts.ts

export const metadata: Metadata = {
  title: "HR-One Donuts - Resep Tradisional, Rasa Internasional",
  description: "Hadirkan kebahagiaan di setiap gigitan dengan donat artisan buatan keluarga kami yang lembut dan kaya rasa.",
  icons: {
    icon: "/images/favicons.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createPublicServerSupabaseClient();
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = settingsData?.value as unknown as SiteSettings | undefined;
  const theme = await getTheme();
  const copy = await getCopy();

  // Check if user is admin via secure cookie
  let isAdmin = false;
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value) {
      isAdmin = true;
    }
  } catch (error) {
    console.error(' [RootLayout] Failed to check admin cookie:', error);
  }

  return (
    <html lang="id" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${sourGummy.variable} antialiased font-sans bg-background text-foreground transition-colors duration-300 pb-16 md:pb-0`}
      >
        <ScrollToTop />
        <DelayedCardPopup siteSettings={siteSettings} />
        <ThemeProvider theme={theme}>
          <LanguageProvider>
            <EditModeProvider initialCopy={copy} initialTheme={theme} isAdmin={isAdmin}>
              <LoadingProvider>
                <ErrorPopupProvider>
                <CartProvider>
                <TrafficTracker />
                <div id="main-content" className="min-h-screen">
                  {children}
                </div>
                <CartDrawer siteSettings={siteSettings} />
                <BottomNav />
                <EditModeToggle />
                <ThemePanel />
                <ChatbotWidget />
                
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
              </ErrorPopupProvider>
            </LoadingProvider>
          </EditModeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
