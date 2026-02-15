import { OrderStep } from "@/types/cms";

export default function OrderSteps({ steps: cmsSteps }: { steps?: OrderStep[] }) {
  const defaultSteps = [
    { num: 1, title: "Pilih Donat", desc: "Lihat menu katalog kami dan pilih favorit Anda." },
    { num: 2, title: "Pesan WhatsApp", desc: "Kirim list pesanan Anda ke nomor WhatsApp kami." },
    { num: 3, title: "Donat Diantar", desc: "Selesaikan pembayaran dan donat akan segera meluncur." }
  ];

  const steps = cmsSteps && cmsSteps.length > 0 
    ? cmsSteps.map(s => ({ num: s.step_number, title: s.title, desc: s.description }))
    : defaultSteps;

  return (
    <section className="bg-section-bg py-16 px-6 md:px-20 lg:px-40 transition-colors duration-300" id="how-to-order">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-heading tracking-tight">Cara Pesan Sangat Mudah</h2>
          <p className="text-subheading text-lg md:text-xl max-w-2xl mx-auto">Ikuti langkah sederhana berikut untuk menikmati donat kami di rumah.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 rounded-full"></div>
          
          {steps.map((step) => (
            <div key={step.num} className="group relative flex flex-col items-center text-center gap-8">
              <div className="w-24 h-24 rounded-[32px] bg-card-bg text-primary flex items-center justify-center text-4xl font-black shadow-2xl z-10 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-border">
                {step.num}
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-2xl font-bold text-heading group-hover:text-primary transition-colors">{step.title}</h4>
                <p className="text-subheading text-lg leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
