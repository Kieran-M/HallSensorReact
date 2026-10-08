/** Animated / static SVG sketches for the custom-setup wizard. */

import type { MagnetShape } from "../../../types/magnet";
import type { MotionType } from "../../../types/motion";

export function MotionPreview({ type }: { type: MotionType }) {
  if (type === "linear") {
    return (
      <svg viewBox="0 0 160 72" className="w-full h-16" aria-hidden>
        <rect x="66" y="48" width="28" height="8" rx="1" fill="#1a3a2a" />
        <rect x="74" y="43" width="12" height="6" rx="0.5" fill="#111" />
        <circle cx="80" cy="41" r="2" fill="var(--accent)" opacity="0.9" />
        <line
          x1="18"
          y1="28"
          x2="142"
          y2="28"
          stroke="var(--accent)"
          strokeWidth="0.6"
          strokeDasharray="3 3"
          opacity="0.35"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-48,0; 48,0; -48,0"
            dur="2.6s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <rect x="56" y="18" width="22" height="12" rx="1.5" fill="#c0392b" />
          <rect x="78" y="18" width="22" height="12" rx="1.5" fill="#2980b9" />
          <text
            x="67"
            y="27"
            textAnchor="middle"
            fontSize="7"
            fill="white"
            fontFamily="monospace"
            fontWeight="bold"
          >
            N
          </text>
          <text
            x="89"
            y="27"
            textAnchor="middle"
            fontSize="7"
            fill="white"
            fontFamily="monospace"
            fontWeight="bold"
          >
            S
          </text>
        </g>
      </svg>
    );
  }

  if (type === "rotate") {
    const cx = 80;
    const cy = 28;
    const r = 16;
    return (
      <svg viewBox="0 0 160 72" className="w-full h-16" aria-hidden>
        <rect x="66" y="56" width="28" height="8" rx="1" fill="#1a3a2a" />
        <rect x="74" y="51" width="12" height="6" rx="0.5" fill="#111" />
        <circle cx="80" cy="49" r="2" fill="var(--accent)" opacity="0.9" />
        <circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.55"
          strokeDasharray="2.5 2.5"
          opacity="0.3"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${cx} ${cy}`}
            to={`360 ${cx} ${cy}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
          <path
            d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
            fill="#2980b9"
          />
          <path
            d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`}
            fill="#c0392b"
          />
          <line
            x1={cx}
            y1={cy - r}
            x2={cx}
            y2={cy + r}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.7"
          />
          <text
            x={cx - r * 0.4}
            y={cy + 2.5}
            textAnchor="middle"
            fontSize="7"
            fill="white"
            fontFamily="monospace"
            fontWeight="bold"
          >
            N
          </text>
          <text
            x={cx + r * 0.4}
            y={cy + 2.5}
            textAnchor="middle"
            fontSize="7"
            fill="white"
            fontFamily="monospace"
            fontWeight="bold"
          >
            S
          </text>
        </g>
      </svg>
    );
  }

  // hinge
  return (
    <svg viewBox="0 0 160 72" className="w-full h-16" aria-hidden>
      <circle cx="36" cy="48" r="3" fill="var(--muted-foreground)" />
      <rect x="112" y="44" width="22" height="8" rx="1" fill="#1a3a2a" />
      <rect x="118" y="39" width="10" height="6" rx="0.5" fill="#111" />
      <circle cx="123" cy="37" r="2" fill="var(--accent)" opacity="0.9" />
      <path
        d="M 36 48 A 70 70 0 0 1 120 48"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
        opacity="0.3"
      />
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-55 36 48; 5 36 48; -55 36 48"
          dur="2.2s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
        />
        <line
          x1="36"
          y1="48"
          x2="108"
          y2="48"
          stroke="var(--muted-foreground)"
          strokeWidth="1.8"
        />
        <rect x="94" y="40" width="22" height="10" rx="1.5" fill="#c0392b" />
        <rect x="105" y="40" width="11" height="10" rx="1.5" fill="#2980b9" />
      </g>
    </svg>
  );
}

export function MagnetShapePreview({ shape }: { shape: MagnetShape }) {
  const uid = shape.replace(/_/g, "");

  if (shape === "bar") {
    return (
      <svg viewBox="0 0 120 56" className="w-full h-14" aria-hidden>
        <rect x="18" y="18" width="42" height="20" rx="2" fill="#c0392b" />
        <rect x="60" y="18" width="42" height="20" rx="2" fill="#2980b9" />
        <text
          x="39"
          y="32"
          textAnchor="middle"
          fontSize="9"
          fill="white"
          fontFamily="monospace"
          fontWeight="bold"
        >
          N
        </text>
        <text
          x="81"
          y="32"
          textAnchor="middle"
          fontSize="9"
          fill="white"
          fontFamily="monospace"
          fontWeight="bold"
        >
          S
        </text>
      </svg>
    );
  }

  if (shape === "diametric_cylinder") {
    return (
      <svg viewBox="0 0 120 56" className="w-full h-14" aria-hidden>
        <ellipse cx="60" cy="28" rx="28" ry="16" fill="#c0392b" />
        <path d="M 60 12 A 28 16 0 0 1 60 44 Z" fill="#2980b9" />
        <text
          x="44"
          y="31"
          textAnchor="middle"
          fontSize="8"
          fill="white"
          fontFamily="monospace"
          fontWeight="bold"
        >
          N
        </text>
        <text
          x="76"
          y="31"
          textAnchor="middle"
          fontSize="8"
          fill="white"
          fontFamily="monospace"
          fontWeight="bold"
        >
          S
        </text>
      </svg>
    );
  }

  if (shape === "axial_cylinder") {
    return (
      <svg viewBox="0 0 120 56" className="w-full h-14" aria-hidden>
        <defs>
          <linearGradient id={`ax-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0392b" />
            <stop offset="100%" stopColor="#2980b9" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="14" rx="18" ry="6" fill="#c0392b" />
        <rect x="42" y="14" width="36" height="26" fill={`url(#ax-${uid})`} />
        <ellipse cx="60" cy="40" rx="18" ry="6" fill="#2980b9" />
      </svg>
    );
  }

  if (shape === "ring" || shape === "axial_ring") {
    const axial = shape === "axial_ring";
    return (
      <svg viewBox="0 0 120 56" className="w-full h-14" aria-hidden>
        {axial ? (
          <>
            <defs>
              <linearGradient id={`rg-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c0392b" />
                <stop offset="100%" stopColor="#2980b9" />
              </linearGradient>
            </defs>
            <ellipse cx="60" cy="16" rx="22" ry="7" fill="#c0392b" />
            <path
              d="M 38 16 L 38 38 A 22 7 0 0 0 82 38 L 82 16 A 22 7 0 0 1 38 16"
              fill={`url(#rg-${uid})`}
            />
            <ellipse cx="60" cy="38" rx="22" ry="7" fill="#2980b9" />
            <ellipse cx="60" cy="16" rx="10" ry="3.5" fill="var(--card)" />
            <ellipse cx="60" cy="38" rx="10" ry="3.5" fill="var(--card)" />
          </>
        ) : (
          <>
            <ellipse cx="60" cy="28" rx="24" ry="14" fill="#c0392b" />
            <path d="M 60 14 A 24 14 0 0 1 60 42 Z" fill="#2980b9" />
            <ellipse cx="60" cy="28" rx="10" ry="6" fill="var(--card)" />
          </>
        )}
      </svg>
    );
  }

  // sphere
  return (
    <svg viewBox="0 0 120 56" className="w-full h-14" aria-hidden>
      <defs>
        <radialGradient id={`sp-${uid}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#e07468" />
          <stop offset="45%" stopColor="#c0392b" />
          <stop offset="55%" stopColor="#2980b9" />
          <stop offset="100%" stopColor="#1a5276" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="28" r="18" fill={`url(#sp-${uid})`} />
      <path
        d="M 60 10 A 18 18 0 0 1 60 46"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
    </svg>
  );
}
