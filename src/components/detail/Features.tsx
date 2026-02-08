export default function ProductDetailFeatures() {
  const features = [
    {
      icon: "schedule",
      title: "Fresh Daily",
      desc: "Baked at 4:00 AM every single morning for peak freshness.",
    },
    {
      icon: "eco",
      title: "Natural Ingredients",
      desc: "Real strawberries and organic flour from local farmers.",
    },
    {
      icon: "family_history",
      title: "Family Recipe",
      desc: "A third-generation dough recipe passed down since 1974.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 py-12 border-t border-slate-200 dark:border-slate-800 w-full">
      {features.map((feature) => (
        <div key={feature.title} className="flex flex-col items-center text-center gap-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">{feature.icon}</span>
          </div>
          <h4 className="font-bold text-heading dark:text-white">{feature.title}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
}
