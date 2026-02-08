export default function CatalogFilters() {
  const tabs = [
    "Semua Rasa",
    "Koleksi Klasik",
    "Seri Premium",
    "Spesial Musiman",
    "Paket Pesta",
  ];

  return (
    <div className="sticky top-[74px] z-40 bg-background py-4 transition-all">
      <div className="flex border-b border-border gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`flex flex-col items-center justify-center pb-3 min-w-max transition-all ${
              index === 0
                ? "border-b-[3px] border-primary text-heading"
                : "border-b-[3px] border-transparent text-subheading hover:text-primary"
            }`}
          >
            <p className="text-sm font-bold">{tab}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
