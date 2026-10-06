import type { ReactNode } from "react";

interface AccordionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** Collapsible section used by the design side panel. */
export function Accordion({ title, open, onToggle, children }: AccordionProps) {
  return (
    <div className="border border-[var(--border)] rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--muted)]/30 hover:bg-[var(--muted)]/60 transition-colors"
      >
        <span className="font-mono text-[13px] uppercase tracking-widest text-[var(--accent)]">
          {title}
        </span>
        <svg
          viewBox="0 0 12 12"
          className="w-3 h-3 text-[var(--muted-foreground)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-4 space-y-3 border-t border-[var(--border)]">
          {children}
        </div>
      )}
    </div>
  );
}
