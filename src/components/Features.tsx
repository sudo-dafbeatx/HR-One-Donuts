import { HeartIcon, StarIcon, ClockIcon } from "@heroicons/react/24/solid";

export default function Features() {
  return (
    <section className="bg-white dark:bg-background-dark py-16 px-4 md:px-20 lg:px-40 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-4xl mx-auto text-center mb-12 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-heading mb-6">
          Mengapa Memilih Donat Keluarga?
        </h2>
        <p className="text-lg md:text-xl text-subheading leading-relaxed max-w-2xl">
          Kami menjaga kualitas dengan bahan-bahan pilihan untuk senyum keluarga Anda.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card-bg border border-border hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <HeartIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-heading">Buatan Sendiri</h3>
          <p className="text-subheading leading-relaxed">
            Dibuat dengan kasih sayang menggunakan resep turun temurun setiap harinya.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card-bg border border-border hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <StarIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-heading">Bahan Premium</h3>
          <p className="text-subheading">
            Hanya menggunakan tepung, mentega, dan topping kualitas grade A.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card-bg border border-border hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <ClockIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-heading">Segar Setiap Hari</h3>
          <p className="text-subheading">
            Selalu segar dari oven kami, menjamin kelembutan tekstur hingga ke tangan Anda.
          </p>
        </div>
      </div>
    </section>
  );
}
