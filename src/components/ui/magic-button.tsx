import React from "react";

export const MagicButton = ({
  title,
  icon,
  position,
  handleClick,
  otherClasses,
}: {
  title: string;
  icon?: React.ReactNode;
  position?: string;
  handleClick?: () => void;
  otherClasses?: string;
}) => {
  return (
    <button
      onClick={handleClick}
      className={`relative inline-flex h-12 w-40 md:w-40 mt-0 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50 gap-6 transition-transform duration-300 hover:scale-105 ${otherClasses}`}
    >
      {/* Shimmering animated border */}
  <span className="absolute inset-0 z-0 rounded-full pointer-events-none border border-transparent before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-red-400 before:via-red-600 before:to-yellow-400 before:opacity-80 before:blur-md before:animate-shimmer" />
      {/* Button content */}
      <span className="relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl gap-2">
        {position === "left" && icon}
        {title}
        {position === "right" && icon}
      </span>
      <style jsx>{`
        @keyframes shimmer {
          0% { filter: blur(10px) brightness(1.2); opacity: 0.8; }
          50% { filter: blur(18px) brightness(1.7); opacity: 1; }
          100% { filter: blur(10px) brightness(1.2); opacity: 0.8; }
        }
        .before\:animate-shimmer::before {
          animation: shimmer 1.5s linear infinite;
        }
      `}</style>
    </button>
  );
};
