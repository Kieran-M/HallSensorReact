import { useEffect, useState, type CSSProperties } from "react";
import type { HallType, PackageOutline } from "../../../types/simulation";
import { hallTypeColor, PACKAGE_OUTLINE_LABELS } from "../../../lib/packageVisuals";
import {
  packageThumbKey,
  resolvePackageModel,
} from "../../../lib/packageModels";
import {
  peekPackageThumb,
  renderPackageThumb,
} from "../../../lib/renderPackageThumb";

/** Catalog / side-panel package preview — official GLB render when available. */
export function PackageThumb({
  outline,
  hallType,
  packageLabel,
  size = 56,
}: {
  outline: PackageOutline;
  hallType: HallType;
  /** Datasheet package string — picks DFN1010 vs 1410 etc. */
  packageLabel?: string | null;
  size?: number;
}) {
  const { accent } = hallTypeColor(hallType);
  const model = resolvePackageModel(outline, packageLabel);
  const title =
    packageLabel?.trim() ||
    PACKAGE_OUTLINE_LABELS[outline] ||
    outline;

  const frameStyle = {
    width: size,
    height: size,
    background:
      "linear-gradient(145deg, color-mix(in srgb, var(--muted) 70%, transparent), transparent)",
    border: "1px solid var(--border)",
  } as const;

  if (model) {
    return (
      <GlbThumb
        modelId={model.id}
        model={model}
        title={title}
        size={size}
        frameStyle={frameStyle}
        fallbackAccent={accent}
        fallbackOutline={outline}
        packageLabel={packageLabel}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className="shrink-0 rounded-sm"
      style={frameStyle}
    >
      <title>{title}</title>
      <ThumbArt
        kind={packageThumbKey(outline, packageLabel)}
        accent={accent}
      />
    </svg>
  );
}

function GlbThumb({
  modelId,
  model,
  title,
  size,
  frameStyle,
  fallbackAccent,
  fallbackOutline,
  packageLabel,
}: {
  modelId: string;
  model: NonNullable<ReturnType<typeof resolvePackageModel>>;
  title: string;
  size: number;
  frameStyle: CSSProperties;
  fallbackAccent: string;
  fallbackOutline: PackageOutline;
  packageLabel?: string | null;
}) {
  const [src, setSrc] = useState<string | undefined>(() =>
    peekPackageThumb(modelId),
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (src) return;
    let cancelled = false;
    renderPackageThumb(model)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [model, modelId, src]);

  if (src) {
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt=""
        title={title}
        aria-hidden
        className="shrink-0 rounded-sm object-contain"
        style={frameStyle}
        draggable={false}
      />
    );
  }

  if (failed) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden
        className="shrink-0 rounded-sm"
        style={frameStyle}
      >
        <title>{title}</title>
        <ThumbArt
          kind={packageThumbKey(fallbackOutline, packageLabel)}
          accent={fallbackAccent}
        />
      </svg>
    );
  }

  return (
    <div
      className="shrink-0 rounded-sm animate-pulse"
      style={frameStyle}
      title={title}
      aria-hidden
    />
  );
}

function ThumbArt({ kind, accent }: { kind: string; accent: string }) {
  const body = "#1e293b";
  const lead = "#d4c4a0";
  const mark = accent;

  if (kind === "sip3") {
    return (
      <>
        <ellipse cx="32" cy="26" rx="14" ry="16" fill={body} />
        <ellipse cx="32" cy="18" rx="10" ry="6" fill="#334155" />
        <circle cx="32" cy="22" r="3" fill={mark} />
        <rect x="24" y="40" width="3" height="16" rx="1" fill={lead} />
        <rect x="30.5" y="40" width="3" height="18" rx="1" fill={lead} />
        <rect x="37" y="40" width="3" height="16" rx="1" fill={lead} />
      </>
    );
  }

  if (kind === "dfn1010") {
    return (
      <>
        <rect x="16" y="16" width="32" height="32" rx="2.5" fill={body} />
        <rect x="24" y="24" width="16" height="16" rx="1.5" fill={mark} opacity="0.9" />
        <circle cx="22" cy="22" r="1.6" fill="#e2e8f0" />
        <rect x="17" y="17" width="8" height="8" rx="1" fill={lead} opacity="0.95" />
        <rect x="39" y="17" width="8" height="8" rx="1" fill={lead} opacity="0.95" />
        <rect x="17" y="39" width="8" height="8" rx="1" fill={lead} opacity="0.95" />
        <rect x="39" y="39" width="8" height="8" rx="1" fill={lead} opacity="0.95" />
      </>
    );
  }

  if (kind === "dfn1410" || kind === "dfn") {
    return (
      <>
        <rect x="20" y="14" width="24" height="36" rx="2.5" fill={body} />
        <rect x="25" y="24" width="14" height="16" rx="1.5" fill={mark} opacity="0.9" />
        <circle cx="26" cy="20" r="1.5" fill="#e2e8f0" />
        <rect x="22" y="16" width="7" height="6" rx="1" fill={lead} />
        <rect x="35" y="16" width="7" height="6" rx="1" fill={lead} />
        <rect x="22" y="42" width="7" height="6" rx="1" fill={lead} />
        <rect x="35" y="42" width="7" height="6" rx="1" fill={lead} />
      </>
    );
  }

  if (kind === "dfn2020") {
    return (
      <>
        <rect x="14" y="14" width="36" height="36" rx="2.5" fill={body} />
        <rect x="24" y="24" width="16" height="16" rx="1.5" fill={mark} opacity="0.85" />
        {[18, 29, 40].map((y) => (
          <g key={y}>
            <rect x="15" y={y} width="7" height="5" rx="1" fill={lead} />
            <rect x="42" y={y} width="7" height="5" rx="1" fill={lead} />
          </g>
        ))}
      </>
    );
  }

  if (kind === "sot553") {
    return (
      <>
        <rect x="20" y="22" width="24" height="18" rx="2" fill={body} />
        <rect x="26" y="26" width="12" height="8" rx="1" fill={mark} />
        <rect x="14" y="24" width="5" height="3" rx="1" fill={lead} />
        <rect x="14" y="30" width="5" height="3" rx="1" fill={lead} />
        <rect x="14" y="36" width="5" height="3" rx="1" fill={lead} />
        <rect x="45" y="24" width="5" height="3" rx="1" fill={lead} />
        <rect x="45" y="36" width="5" height="3" rx="1" fill={lead} />
      </>
    );
  }

  if (kind === "sc59") {
    return (
      <>
        <rect x="18" y="24" width="28" height="14" rx="2" fill={body} />
        <rect x="24" y="27" width="14" height="7" rx="1" fill={mark} />
        <circle cx="22" cy="28" r="1.4" fill="#e2e8f0" />
        <rect x="12" y="26" width="5" height="3" rx="1" fill={lead} />
        <rect x="12" y="33" width="5" height="3" rx="1" fill={lead} />
        <rect x="47" y="29.5" width="5" height="3" rx="1" fill={lead} />
      </>
    );
  }

  return (
    <>
      <rect x="18" y="24" width="28" height="14" rx="2" fill={body} />
      <rect x="24" y="27" width="14" height="7" rx="1" fill={mark} />
      <circle cx="22" cy="28" r="1.4" fill="#e2e8f0" />
      <rect x="12" y="26" width="5" height="3" rx="1" fill={lead} />
      <rect x="12" y="33" width="5" height="3" rx="1" fill={lead} />
      <rect x="47" y="29.5" width="5" height="3" rx="1" fill={lead} />
    </>
  );
}
