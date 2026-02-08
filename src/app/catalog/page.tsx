import CatalogNavbar from "@/components/catalog/Navbar";
import CatalogHero from "@/components/catalog/Hero";
import CatalogFilters from "@/components/catalog/Filters";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogCTA from "@/components/catalog/CTA";
import Footer from "@/components/Footer";

export default function CatalogPage() {
  const products = [
    {
      id: "classic-glazed",
      name: "Glazed Klasik",
      price: 12000,
      description: "Favorit sepanjang masa, adonan lembut sempurna dengan lapisan madu khas.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0wiT6qFEqug77pjnddnAne8HeuukD0QKQPYpLrrYzgiAD4eeHfeVUXVsLMR3gOJBaPHEFrxsTVM9RDr4yuZlcPfXBEhtQz4XJnQ8lXrLZktcqZNDkHBkokHPBU9AdFvo6wEiEH5uZpNBn0HWwHB6MKcIp796GQALpJY6KyCPvc-tsqTY6EARbg_TzgbWWAE27bhWBtiQ7m-qjMr0QEgxbr5UWuJ9PrYX5bvjRbON66lewM-WnxrmIafCvxAgJM8SF_YGxq3x4Nh5v",
      tag: "Terlaris",
    },
    {
      id: "chocolate-dream",
      name: "Cokelat Impian",
      price: 15000,
      description: "Ganache cokelat hitam mewah dengan taburan serutan cokelat Belgia.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAvhBgVo2CSujDOE--X4SqRz1zqunePaFhkFLk0t7pwzuDsaoO7B79bl4f0UTPBwCRiR2F4_2oqLAIt5enNT-z5kcnyy5obi6-AWQxN7Mfa4_pGkbiepFH2lIgrG3WzB7uLwma0puGIhInZN2fLVUwW-uE5jPg5Dw1VzhwfrDHiZBll3EKE5QgezTvLrkxuV3Y8EbhHzsdJk3jKmlfYkjdY5Rwl9UxyI7L1MMPHjRFtAXLO4o_BjI_hXHCusMmGXoMeRzO76q8s9Up",
    },
    {
      id: "lotus-biscoff",
      name: "Lotus Biscoff",
      price: 18000,
      description: "Isian krim mentega biskuit dengan taburan remah Biscoff.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXZUAv6P31flDtamJ4ew3MIa5aPHhvqQvaWEUwTw9Tk7wAeuM5YhwBxjFgzDKJNjzvAGgtauD8P5f9VgYV6WhiFnPHc2YKqEcpMD8sW1CnZoIrZd0tqvNdxSikrY4K_xxdH6C4zkTJQJXWWQVpo-ucuU0Vj8j8E151aKGUTpDR5pcuEbUrJK4i2fH8E2reQKUFAIyu3f7b_f1KZ3GYSZhJEx0Rj_5xdJ9Ft5UZyoIAuB81kljutTr1AWG0G67SkvL-rokC9aqcpoJc",
      tag: "Premium",
    },
    {
      id: "strawberry-sparkle",
      name: "Kilau Stroberi",
      price: 15000,
      description: "Icing stroberi segar dari buah asli dengan lelehan cokelat putih.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBdCwbJGcyKGuZNyKGLdPGYTpaSx9OHDl6d1g75lU92dmMoeb7jumEvxL1iETv_SOpzhiD4c19rizmq8vxcLNSYz6BQmv0e-6A3SmS8FjIr1F0wKCsSxt5mNi1XpDmeSOty14yE8fyb8Mv4SoBo_OKYEluj2S9E4WLbBRqNOZ4mNI-dLnK8o12nFPLUXmNzP97HFzhQOWaL1wckwlu1f7uY0AoAqQXVMW3BsWl5-Ap1_8EKWMwd_ul4djXhf9iFz-mjpDQGcoIET9d",
    },
    {
      id: "pistachio-perfection",
      name: "Pistachio Sempurna",
      price: 22000,
      description: "Lapisan pistachio krimi dengan taburan pistachio Sisilia panggang.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtbRCzvOL8Eq45HBbGI-MoJomRyA-nbSNHucyKrUzQeeZQOTqH-jITHF8goPfCJlIvbvMVDsI8aaYp5mSZfiJN9Mrr5cqD3B3zWyRZsCXhYqwBr77PQv6t9q_QvsYbYwSH-yciFAm09HaqqgtaNaWekbG0R4cDDu2y5hPiRfmt-2bZFw4DL-GjEHV2OxMDix2pBX6lwGfTr-OL2460Gq_TZ4ckhJfxznd1CqbkGROcVvcBdNnF_139dZRuWFt4PcuDw1I4KclxP9mM",
      tag: "Premium",
    },
    {
      id: "nutella-heaven",
      name: "Nutella Heaven",
      price: 20000,
      description: "Melimpah dengan isian Nutella dan taburan gula halus.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTfeQXZDwNKJFjSYk21Y0SAxtcSOL04N3RzYMHqQLCdQHar3ymKcwDoE0JSSWM4RsQytuvi_6QngzEHH88M84jMHpau0IQ7KUoktoWVPhpC90rbqGyQnUjlBqW2AUn3lTgm9I4Zhb9H57ULsmjff2qZ0Y7Z9eBcTe1yVhQPJ_wcDG9MnqMQSCA6OGCYnO1H3uow-Hejjwfg-Q4NXJ1UwB-rAnusrelW3OR56FZ0Z5uFxkCOTxCb02TbDRUJQpSFneqc66KTdB_I-Hg",
    },
    {
      id: "blueberry-blast",
      name: "Ledakan Blueberry",
      price: 15000,
      description: "Isian selai blueberry liar dengan lapisan vanilla ringan.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAPyM3b51FTofVW3UaoJbWneerHLF1HLQExAVR3Rsf5Dp_D2iaqDE8uInBj_0o1Erc4xDXUaXP81xPZFuGFkQdXnrnUNjQ3_Z5-H-DtadzbUioY6R4epRLTVMSRGgOA6zxamOc66ubqNB8vjOHfjX_eUbjyVt20AKGmhX9S57BNWc3U6OVzH22SBa3v73RqmUZ711_1cRaWiY65NwCZZ-g_IytS_0QDwz9AsssdHvgG7u3_lpzCO8rVkgpnU6hYfENhuDJXHVhBjUS",
      tag: "Baru",
    },
    {
      id: "cinnamon-sugar",
      name: "Gula Kayu Manis",
      price: 12000,
      description: "Donat cincin klasik berbalut campuran kayu manis dan gula yang hangat.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9DEpFh2H-6jbYZzji5-Ug0_AGsGA1VyUoIafT-HnTCUp2DyCeyl-QlDnI5ex1TOQ9bNOsY2sc6joAO004ztwldFm5UQGal-ueK4nxxFp1K6O83JMA3nexEdK0anWAWHr2Ontvy3Q_BaDMugAWD4spstD47YVuELScxD0rEIL8QkK_gbYKw9m4zOFuDbuAi8bnOoiHcCciASREO_W-FhK79Zg__qJGShOl9m1KjPRu9GnfS5G_UCdRJWpQ_yywCyc8VHO-Arg-8ZjL",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <CatalogNavbar />
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 transition-colors duration-300">
        <CatalogHero />
        <CatalogFilters />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        <CatalogCTA />
      </main>
      <Footer />
    </div>
  );
}
