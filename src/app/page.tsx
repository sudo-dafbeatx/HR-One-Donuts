import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TopPicks from "@/components/TopPicks";
import OrderSteps from "@/components/OrderSteps";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <TopPicks />
        <OrderSteps />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
