export default function OrderSteps() {
  return (
    <section className="bg-section-bg py-20 px-4 md:px-20 lg:px-40 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-heading mb-6">Cara Pesan Sangat Mudah</h2>
          <p className="text-subheading text-lg md:text-xl">Ikuti langkah sederhana berikut untuk menikmati donat kami.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-primary/20"></div>
          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-card-bg text-primary flex items-center justify-center text-3xl font-black shadow-xl z-10 transition-colors">
              1
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold text-heading">Pilih Donat</h4>
              <p className="text-subheading">Lihat menu katalog kami dan pilih favorit Anda.</p>
            </div>
          </div>
          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-card-bg text-primary flex items-center justify-center text-3xl font-black shadow-xl z-10 transition-colors">
              2
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold text-heading">Chat WhatsApp</h4>
              <p className="text-subheading">Kirim list pesanan Anda ke nomor WhatsApp kami.</p>
            </div>
          </div>
          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-card-bg text-primary flex items-center justify-center text-3xl font-black shadow-xl z-10 transition-colors">
              3
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xl font-bold text-heading">Donat Diantar</h4>
              <p className="text-subheading">Selesaikan pembayaran dan donat akan segera meluncur.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
