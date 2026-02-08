export default function OrderSteps() {
  return (
    <section className="bg-primary py-20 px-4 md:px-20 lg:px-40">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-16">
          Cara Pesan Sangat Mudah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-white/20"></div>
          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-black shadow-xl z-10">
              1
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold text-white">Pilih Donat</h4>
              <p className="text-white/80">Lihat menu katalog kami dan pilih favorit Anda.</p>
            </div>
          </div>
          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-black shadow-xl z-10">
              2
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold text-white">Chat WhatsApp</h4>
              <p className="text-white/80">Kirim list pesanan Anda ke nomor WhatsApp kami.</p>
            </div>
          </div>
          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-black shadow-xl z-10">
              3
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold text-white">Donat Diantar</h4>
              <p className="text-white/80">Selesaikan pembayaran dan donat akan segera meluncur.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
