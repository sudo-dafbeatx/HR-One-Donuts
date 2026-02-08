export default function CatalogHero() {
  return (
    <div className="flex flex-col gap-4 mb-10">
      <div className="flex flex-col gap-2">
        <span className="text-primary font-bold tracking-widest text-xs uppercase">Our Menu</span>
        <h1 className="text-heading dark:text-white text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Freshly Handcrafted Every Day
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-prose leading-relaxed">
          Explore our delicious range of handmade donuts. From timeless classics to premium delights, we bake every batch with love.
        </p>
      </div>
    </div>
  );
}
