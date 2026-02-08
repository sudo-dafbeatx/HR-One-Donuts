import Link from "next/link";
import CatalogNavbar from "@/components/catalog/Navbar";
import ProductGallery from "@/components/detail/Gallery";
import ProductInfo from "@/components/detail/Info";
import ProductDetailFeatures from "@/components/detail/Features";
import Footer from "@/components/Footer";

// This is required for static export if you use it, otherwise dynamic is fine
export function generateStaticParams() {
  return [
    { id: "classic-glazed" },
    { id: "chocolate-dream" },
    { id: "lotus-biscoff" },
    { id: "strawberry-sparkle" },
    { id: "pistachio-perfection" },
    { id: "nutella-heaven" },
    { id: "blueberry-blast" },
    { id: "cinnamon-sugar" },
  ];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  console.log("Viewing product:", productId);

  // Simple lookup for demo purposes
  const productPrices: Record<string, number> = {
    "classic-glazed": 12000,
    "chocolate-dream": 15000,
    "lotus-biscoff": 18000,
    "strawberry-sparkle": 15000,
    "pistachio-perfection": 22000,
    "nutella-heaven": 20000,
    "blueberry-blast": 15000,
    "cinnamon-sugar": 12000,
  };

  const productNames: Record<string, string> = {
    "classic-glazed": "Glazed Klasik",
    "chocolate-dream": "Cokelat Impian",
    "lotus-biscoff": "Lotus Biscoff",
    "strawberry-sparkle": "Kilau Stroberi",
    "pistachio-perfection": "Pistachio Sempurna",
    "nutella-heaven": "Nutella Heaven",
    "blueberry-blast": "Ledakan Blueberry",
    "cinnamon-sugar": "Gula Kayu Manis",
  };

  const name = productNames[productId] || "Strawberry Dream Glazed";
  const price = productPrices[productId] || 15000;

  // Mock product data – in a real app, you'd fetch this based on productId
  const product = {
    id: productId,
    name: name,
    price: price,
    description: `Donat ragi buatan tangan yang empuk (${name}) dibalut dalam glaze madu khas kami dan ditaburi bahan-bahan premium. Setiap gigitan adalah keseimbangan rasa manis, cita rasa mewah, dan tekstur yang lembut lumer di mulut dari resep rahasia keluarga kami.`,
    reviews: 48,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnobsGwq4QbPlht6jD-95PfuFMS55s0j6zSoLBd7_Ijl6z7ZYQyvibbbONOxnzt5M4HVhYCLlkA0VwzEMH_V2e2HeDFBg6zWqHgTOgOWZXtK1D1MrBV8b4Bd0Ft9zdV7K0SNxGLDExZnxmuWoxFV-omInyHIbJUUZg_4Vucl8cxL1k5qV3BnPduPdrfPsMeZMI-bJAbVB7ZOadL-z3zw2cV7kMx-ohbWv3RSdAr3sSEh7SscwzhdZzpqZWn17BIhzHNFi0ShYnexXi",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9IxhAli4I-TMjxE692bAf8q9XdhZ_4yfNnCPitnKGJKHkLR0_Y-kf8uY5sdjRrIgfsGEMfphCkIGgeWESlOzF9t-z9LB8Nm3bGY6lPHRMV73fn-KAWVWXsZHSpGeqUN3OWFFuNyxwOROPlZn4xNLAQN001HvvEa-Fl9g59dv5jO2SZSOs8gf85FyMOBcaSXZxwDEW7BRBT0NTB7mPFIcne93b2l-rtv-ux3EjXNX9UdMby8oH_qDMrB3rMYSQZ6bes0Kymbf4apQ1",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPaXUDhSNr1X7zbmQ_E0Oq8Xp8ukGARa58dQdt_frYmlZiLLDsvxHiMk9_LG2EaBpCqQf76d7yBeVa3zogMhqUmHZoHv_ROgGDPQB1R-a5ezZAdWKwLffIikZWEolMQH2wYKRGNOAqwOYK1mWdk1Rjnih3EMuvzTedN8iVxi0SuVOIv9FARN0YuJ9PKyZOca4tbWsxcloF-IY1EMvQToCM_g0xF8xyFryRz7OQ0T3QGxUhveZwH5gejnMGgG2QdAirdYnDQdzw5zpf",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRDLo54-4k0wSoBME_wZUa6OCPHPeasMDWzAsZdE2onEFhaLo1EdXIn4yQzKY5Z6t4QM9lkOimBJp1OV0-QaN1ZTlmHx_emzV9s-b16mR6V0b3mZ0LTHsRmvqaw8uqznB9-vVzfI6lPRmc2y3hsQIyO1lnadUHaWrdv0HiYbNYCTuh0rJ6vqJSS_WXtHL_YBq3NWP5f1h_Hy1USWYRQTUIU-IcQ4R5OyPJim6wJDb_l5BHr4aKRuBQj63xwxTVCY9aQx2V6UEfUCcl",
    ]
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <CatalogNavbar />
      
      <main className="flex-1 flex flex-col items-center py-8 px-6 lg:px-40">
        <div className="max-w-[1200px] w-full">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
              Beranda
            </Link>
            <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            <Link href="/catalog" className="dark:text-slate-400 hover:text-primary transition-colors">
              Katalog
            </Link>
            <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            <span className="text-primary truncate max-w-[200px] md:max-w-none">{product.name}</span>
          </nav>
 
          {/* Product Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ProductGallery images={product.images} />
            <ProductInfo 
              id={product.id}
              name={product.name} 
              price={product.price} 
              description={product.description} 
              reviews={product.reviews} 
              image={product.images[0]}
            />
          </div>

          <ProductDetailFeatures />
        </div>
      </main>

      {/* Floating WhatsApp Action */}
      <a
        href="#"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform duration-300"
      >
        <span className="font-bold flex items-center gap-2">
           <span className="material-symbols-outlined">chat</span>
           Chat untuk Pesan
        </span>
      </a>

      <Footer />
    </div>
  );
}
