import React from "react";

interface RibbonProps {
  items: Array<{ label: string; onClick: () => void }>;
  selected: string;
}

export const Ribbon: React.FC<RibbonProps> = ({ items, selected }) => (
  <div className="flex items-center gap-2 py-2 px-1">
    <div
      className="flex overflow-x-auto gap-2 hide-scrollbar"
      style={{ maxWidth: '80vw', scrollBehavior: 'smooth' }}
      id="ribbon-scroll"
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className={`whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-colors duration-200 border border-gray-200 bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white ${item.label === selected ? 'bg-red-600 text-white' : ''}`}
          style={{ minWidth: '80px' }}
        >
          {item.label}
        </button>
      ))}
    </div>
    <button
      aria-label="Scroll right"
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 shadow"
      onClick={() => {
        const el = document.getElementById('ribbon-scroll');
        if (el) el.scrollBy({ left: 120, behavior: 'smooth' });
      }}
    >
      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&#8250;</span>
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