import type { HallType, PackageOutline } from "../../../types/simulation";
import { hallTypeColor, PACKAGE_OUTLINE_LABELS } from "../../../lib/packageVisuals";

/** Flat SVG package silhouette used in the catalog / side panel. */
export function PackageThumb({
  outline,
  hallType,
  size = 56,
}: {
  outline: PackageOutline;
  hallType: HallType;
  size?: number;
}) {
  const { accent } = hallTypeColor(hallType);
  const body = "#1e293b";
  const lead = "#d4c4a0";
  const mark = accent;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className="shrink-0 rounded-sm"
      style={{
        background:
          "linear-gradient(145deg, color-mix(in srgb, var(--muted) 70%, transparent), transparent)",
        border: "1px solid var(--border)",
      }}
    >
      <title>{PACKAGE_OUTLINE_LABELS[outline]}</title>
      {outline === "sip3" ? (
        <>
          <ellipse cx="32" cy="26" rx="14" ry="16" fill={body} />
          <ellipse cx="32" cy="18" rx="10" ry="6" fill="#334155" />
          <circle cx="32" cy="22" r="3" fill={mark} />
          <rect x="24" y="40" width="3" height="16" rx="1" fill={lead} />
          <rect x="30.5" y="40" width="3" height="18" rx="1" fill={lead} />
          <rect x="37" y="40" width="3" height="16" rx="1" fill={lead} />
        </>
      ) : outline === "dfn" ? (
        <>
          <rect x="16" y="18" width="32" height="28" rx="3" fill={body} />
          <rect x="22" y="24" width="20" height="14" rx="2" fill={mark} opacity="0.85" />
          <rect x="18" y="48" width="6" height="4" rx="1" fill={lead} />
          <rect x="29" y="48" width="6" height="4" rx="1" fill={lead} />
          <rect x="40" y="48" width="6" height="4" rx="1" fill={lead} />
          <rect x="18" y="12" width="6" height="4" rx="1" fill={lead} />
          <rect x="29" y="12" width="6" height="4" rx="1" fill={lead} />
          <rect x="40" y="12" width="6" height="4" rx="1" fill={lead} />
        </>
      ) : outline === "sot553" ? (
        <>
          <rect x="20" y="22" width="24" height="18" rx="2" fill={body} />
          <rect x="26" y="26" width="12" height="8" rx="1" fill={mark} />
          <rect x="14" y="24" width="5" height="3" rx="1" fill={lead} />
          <rect x="14" y="30" width="5" height="3" rx="1" fill={lead} />
          <rect x="14" y="36" width="5" height="3" rx="1" fill={lead} />
          <rect x="45" y="24" width="5" height="3" rx="1" fill={lead} />
          <rect x="45" y="36" width="5" height="3" rx="1" fill={lead} />
        </>
      ) : outline === "sc59" ? (
        <>
          <rect x="18" y="24" width="28" height="14" rx="2" fill={body} />
          <rect x="24" y="27" width="14" height="7" rx="1" fill={mark} />
          <circle cx="22" cy="28" r="1.4" fill="#e2e8f0" />
          <rect x="12" y="26" width="5" height="3" rx="1" fill={lead} />
          <rect x="12" y="33" width="5" height="3" rx="1" fill={lead} />
          <rect x="47" y="29.5" width="5" height="3" rx="1" fill={lead} />
        </>
      ) : (
        <>
          <rect x="18" y="24" width="28" height="14" rx="2" fill={body} />
          <rect x="24" y="27" width="14" height="7" rx="1" fill={mark} />
          <circle cx="22" cy="28" r="1.4" fill="#e2e8f0" />
          <rect x="12" y="26" width="5" height="3" rx="1" fill={lead} />
          <rect x="12" y="33" width="5" height="3" rx="1" fill={lead} />
          <rect x="47" y="29.5" width="5" height="3" rx="1" fill={lead} />
        </>
      )}
    </svg>
  );
}
