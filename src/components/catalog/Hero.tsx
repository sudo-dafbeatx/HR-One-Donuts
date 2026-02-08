export default function CatalogHero() {
  return (
    <div className="flex flex-col gap-4 mb-10">
      <div className="flex flex-col gap-2">
        <span className="text-primary font-bold tracking-widest text-xs uppercase">Menu Kami</span>
        <h1 className="text-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Dibuat dengan Tangan Setiap Hari
        </h1>
        <p className="text-subheading text-lg md:text-xl max-w-prose leading-relaxed">
          Jelajahi berbagai pilihan donat lezat buatan tangan kami. Dari klasik hingga premium, kami memanggang setiap batch dengan cinta.
        </p>
      </div>
    </div>
  );
}
