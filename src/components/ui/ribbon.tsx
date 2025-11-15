import React from "react";

interface RibbonProps {
  items: Array<{ label: string; onClick: () => void }>;
  selected: string;
}

export const Ribbon: React.FC<RibbonProps> = ({ items, selected }) => (
  <div className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4">
    <div
      className="flex overflow-x-auto gap-1.5 sm:gap-2 hide-scrollbar"
      style={{ scrollBehavior: 'smooth' }}
      id="ribbon-scroll"
    >
      {items.map((item) => {
        const isSelected = item.label === selected;
        const base = "whitespace-nowrap px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
        const selectedCls = "bg-red-600 text-white border-transparent";
        const normalCls = "bg-black text-white border-transparent hover:bg-gray-800";
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`${base} ${isSelected ? selectedCls : normalCls}`}
            aria-pressed={isSelected}
          >
            {item.label}
          </button>
        );
      })}
    </div>
    <button
      aria-label="Scroll right"
      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 shadow flex-shrink-0"
      onClick={() => {
        const el = document.getElementById('ribbon-scroll');
        if (el) el.scrollBy({ left: 120, behavior: 'smooth' });
      }}
    >
      <span style={{ fontSize: '1rem', lineHeight: 1 }} className="sm:text-[1.5rem]">&#8250;</span>
    </button>
    <style jsx>{`
      .hide-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
    `}</style>
  </div>
);

// Hide scrollbar utility (add to global CSS if needed)
// .scrollbar-hide::-webkit-scrollbar { display: none; }
// .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }