import { OrderStep } from "@/types/cms";

export default function OrderSteps({ steps: cmsSteps }: { steps?: OrderStep[] }) {
  const defaultSteps = [
    { num: 1, title: "Pilih Produk", desc: "Temukan donat favorit Anda di menu katalog kami.", icon: "shopping_basket" },
    { num: 2, title: "Tambah ke Keranjang", desc: "Pilih jumlah dan tambahkan ke keranjang belanja.", icon: "add_shopping_cart" },
    { num: 3, title: "Login / Daftar", desc: "Masuk ke akun Anda untuk proses pemesanan yang lebih cepat.", icon: "person_add" },
    { num: 4, title: "Isi Alamat & Pembayaran", desc: "Tentukan lokasi pengiriman dan pilih metode pembayaran.", icon: "local_shipping" },
    { num: 5, title: "Konfirmasi Pesanan", desc: "Periksa kembali pesanan Anda dan konfirmasi pembayaran.", icon: "check_circle" }
  ];

  const steps = cmsSteps && cmsSteps.length > 0 
    ? cmsSteps.map(s => ({ num: s.step_number, title: s.title, desc: s.description, icon: "receipt_long" }))
    : defaultSteps;

  return (
    <section className="py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={step.num} className="relative flex flex-col md:flex-row items-center md:items-start gap-6 group">
              {/* Vertical line for desktop */}
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute left-7 top-14 bottom-[-32px] w-0.5 bg-slate-100 group-hover:bg-primary/20 transition-colors" />
              )}
              
              {/* Step Number & Icon */}
              <div className="relative shrink-0 flex items-center justify-center size-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                  {step.icon}
                </span>
                <div className="absolute -top-2 -right-2 size-6 rounded-full bg-primary text-white flex items-center justify-center font-black text-[10px] shadow-lg shadow-primary/20">
                  {step.num}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left pt-1">
                <h4 className="text-lg font-black text-slate-900 mb-1 group-hover:text-primary transition-colors tracking-tight">
                  {step.title}
                </h4>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
