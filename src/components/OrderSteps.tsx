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
    <section className="py-8 px-2 transition-colors duration-300" id="how-to-order">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-8">Cara Pesan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="size-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {step.num}
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-heading">{step.title}</h4>
                <p className="text-xs text-subheading leading-tight">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
