import { useId, type ReactNode } from "react";

interface AccordionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** Collapsible section used by the design side panel. */
export function Accordion({ title, open, onToggle, children }: AccordionProps) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border border-[var(--border)] rounded-sm overflow-hidden">
      <button
        type="button"
        id={buttonId}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--muted)]/30 hover:bg-[var(--muted)]/60 transition-colors"
      >
        <span className="font-mono text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
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
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="px-4 py-4 space-y-3 border-t border-[var(--border)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}
