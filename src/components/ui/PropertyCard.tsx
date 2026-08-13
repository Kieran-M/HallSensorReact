import type { ReactNode } from "react";

interface PropertyCardProps {
  title: string;
  children: ReactNode;
}

export function PropertyCard({
  title,
  children,
}: PropertyCardProps) {
  return (
    <div
      className="
        rounded-lg
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          border-b
          border-slate-200
          px-4
          py-3
        "
      >
        <h3
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          {title}
        </h3>
      </div>

      <div className="p-4">
        {children}
      </div>
    </div>
  );
}