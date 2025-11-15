import React from "react";

export const MagicButton = ({
  title,
  icon,
  position,
  handleClick,
  otherClasses,
  compact = false,
}: {
  title: string;
  icon?: React.ReactNode;
  position?: string;
  handleClick?: () => void;
  otherClasses?: string;
  compact?: boolean;
}) => {
  // Default icon (simple user) used when none provided and compact mode requested
  const DefaultUserIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
      <path d="M2 20a10 10 0 0119.9 0 .75.75 0 01-.74.86H2.84A.75.75 0 012 20z" />
    </svg>
  );

  const baseSizeClasses = compact ? "h-10 w-10 sm:h-12 sm:w-40" : "h-12 w-40 md:w-40";
  const gapClasses = compact ? "gap-2" : "gap-6";

  return (
    <button
      onClick={handleClick}
      className={`relative inline-flex ${baseSizeClasses} mt-0 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50 ${gapClasses} transition-transform duration-300 hover:scale-105 ${otherClasses ?? ''}`}
    >
      {/* Shimmering animated border */}
      <span className="absolute inset-0 z-0 rounded-full pointer-events-none border border-transparent before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-red-400 before:via-red-600 before:to-yellow-400 before:opacity-80 before:blur-md before:animate-shimmer" />
      {/* Button content */}
      <span className="relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
        {position === "left" && icon}
        {/* Icon shown on compact mode (small screens) if provided or fallback shown. Title hidden on xs when compact. */}
        {compact ? (
          <>
            <span className="inline-flex sm:hidden">{icon ?? DefaultUserIcon}</span>
            <span className="hidden sm:inline">{title}</span>
          </>
        ) : (
          <>
            {position === "left" && icon}
            <span className="mx-0">{title}</span>
            {position === "right" && icon}
          </>
        )}
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
