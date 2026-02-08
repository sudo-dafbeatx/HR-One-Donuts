export default function CatalogFilters() {
  const tabs = [
    "All Flavors",
    "Classic Collection",
    "Premium Range",
    "Seasonal Specials",
    "Party Boxes",
  ];

  return (
    <div className="sticky top-[74px] z-40 bg-background-light dark:bg-background-dark py-4 transition-all">
      <div className="flex border-b border-[#cfdbe7] dark:border-slate-800 gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`flex flex-col items-center justify-center pb-3 min-w-max transition-all ${
              index === 0
                ? "border-b-[3px] border-primary text-heading dark:text-white"
                : "border-b-[3px] border-transparent text-[#4c739a] hover:text-primary"
            }`}
          >
            <p className="text-sm font-bold">{tab}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
