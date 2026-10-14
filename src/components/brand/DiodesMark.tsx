import { useTheme } from "../ui/Theme";

/**
 * Official Diodes Incorporated logos (light + dark assets).
 * The Diodes logo is a registered trademark of Diodes Incorporated.
 */

const LOGO_LIGHT = `${import.meta.env.BASE_URL}brand/diodes-logo-light.webp`;
const LOGO_DARK = `${import.meta.env.BASE_URL}brand/diodes-logo-dark.webp`;

export function DiodesMark({
  className = "",
  height = 36,
}: {
  className?: string;
  /** Rendered height in px; width follows aspect ratio. */
  height?: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // Assets ship with solid backgrounds — blend so the plate drops out.
  const blend = isDark ? "screen" : "multiply";

  return (
    <img
      src={isDark ? LOGO_DARK : LOGO_LIGHT}
      alt="Diodes Incorporated"
      height={height}
      className={`block w-auto shrink-0 ${className}`}
      style={{
        height,
        width: "auto",
        mixBlendMode: blend,
      }}
      decoding="async"
    />
  );
}

/** Header lockup: Diodes logo + HallSim product name. */
export function HallSimBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <DiodesMark
        height={compact ? 24 : 36}
        className="max-w-[7.5rem] sm:max-w-none object-contain object-left"
      />
      <div
        className="w-px self-stretch shrink-0 hidden sm:block"
        style={{
          backgroundColor: "var(--border)",
          minHeight: compact ? "1.25rem" : "1.75rem",
        }}
        aria-hidden
      />
      <div className={`min-w-0 ${compact ? "hidden sm:block" : ""}`}>
        <div
          className="font-mono text-xs uppercase tracking-wide truncate"
          style={{ color: "var(--accent)" }}
        >
          HallSim
        </div>
        {!compact && (
          <div
            className="font-mono text-xs tracking-wide truncate"
            style={{ color: "var(--muted-foreground)" }}
          >
            Hall-effect sensor simulator
          </div>
        )}
      </div>
    </div>
  );
}

export function DiodesTrademarkNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`font-mono text-xs leading-relaxed ${className}`}
      style={{ color: "var(--muted-foreground)" }}
    >
      Diodes and the Diodes logo are registered trademarks of Diodes
      Incorporated in the United States and other countries.
    </p>
  );
}
