import { HeartIcon, StarIcon, ClockIcon } from "@heroicons/react/24/solid";

export default function Features() {
  const features = [
    {
      icon: HeartIcon,
      title: "Buatan Sendiri",
      desc: "Dibuat dengan kasih sayang menggunakan resep turun temurun setiap harinya."
    },
    {
      icon: StarIcon,
      title: "Bahan Premium",
      desc: "Hanya menggunakan tepung, mentega, dan topping kualitas grade A."
    },
    {
      icon: ClockIcon,
      title: "Segar Setiap Hari",
      desc: "Selalu segar dari oven kami, menjamin kelembutan tekstur hingga ke tangan Anda."
    }
  ];

  return (
    <section className="bg-white dark:bg-slate-900 py-24 px-6 md:px-20 lg:px-40">
      <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-heading tracking-tight">
          Mengapa Memilih HR-One Donuts?
        </h2>
        <p className="text-lg md:text-xl text-subheading leading-relaxed max-w-2xl mx-auto">
          Kami menjaga kualitas dengan bahan-bahan pilihan untuk senyum keluarga Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {features.map((feature, idx) => (
          <div 
            key={idx}
            className="group flex flex-col items-center text-center p-10 rounded-[40px] bg-card-bg border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
              <feature.icon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-heading">{feature.title}</h3>
            <p className="text-subheading leading-relaxed text-lg">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
