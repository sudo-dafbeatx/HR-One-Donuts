import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TopPicks from "@/components/TopPicks";
import OrderSteps from "@/components/OrderSteps";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch hero data
  const { data: heroData } = await supabase
    .from('hero')
    .select('*')
    .limit(1)
    .single();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Hero 
          title={heroData?.title}
          subtitle={heroData?.subtitle}
          description={heroData?.description}
          ctaText={heroData?.cta_text}
          ctaLink={heroData?.cta_link}
        />
        <Features />
        <TopPicks />
        <OrderSteps />
        <CTA />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
