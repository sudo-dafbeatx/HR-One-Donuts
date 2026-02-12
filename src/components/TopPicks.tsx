import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types/cms";

interface TopPicksProps {
  products: Product[];
}

export default function TopPicks({ products }: TopPicksProps) {
  const { addToCart } = useCart();
  
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-section-bg transition-colors duration-300 px-6 md:px-20 lg:px-40 py-24" id="top-picks">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl md:text-5xl font-black text-heading tracking-tight">Favorit Keluarga</h2>
          <p className="text-lg text-subheading leading-relaxed max-w-xl">Varian donat yang paling banyak dicari minggu ini oleh pelanggan kami.</p>
        </div>
        <Link href="/catalog" className="group text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
          Lihat Semua Menu
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-4 bg-card-bg p-8 rounded-[40px] shadow-sm border border-border group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 min-h-[220px] justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                   {product.sale_type !== 'normal' && (
                    <span className="w-fit bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">
                      Terlaris
                    </span>
                  )}
                  <h4 className="text-xl font-black text-heading group-hover:text-primary transition-colors uppercase">{product.name}</h4>
                </div>
              </div>
              <p className="text-subheading text-xs line-clamp-3 leading-relaxed opacity-80">
                {product.description}
              </p>
            </div>
            
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga</span>
                  <p className="text-primary font-black text-2xl tracking-tighter">Rp {product.price.toLocaleString("id-ID")}</p>
                </div>
                <button 
                  onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url || '' }, 1)}
                  className="size-14 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-primary/20"
                >
                  <PlusIcon className="w-7 h-7 font-black" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
