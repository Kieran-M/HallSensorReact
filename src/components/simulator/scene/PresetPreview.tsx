/** Animated SVG motion sketches for the preset landing cards. */

function SensorChip({
  x,
  y,
  face = "up",
}: {
  x: number;
  y: number;
  /** Sensing face toward magnet */
  face?: "up" | "left";
}) {
  if (face === "left") {
    return (
      <g>
        <rect x={x} y={y} width="7" height="18" rx="1" fill="#1a3a2a" />
        <rect x={x - 4} y={y + 5} width="5" height="8" rx="0.5" fill="#111" />
        <circle cx={x - 2} cy={y + 9} r="1.4" fill="var(--accent)" opacity="0.95" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x - 13} y={y} width="26" height="7" rx="1" fill="#1a3a2a" />
      <rect x={x - 4} y={y - 5} width="8" height="5" rx="0.5" fill="#111" />
      <circle cx={x} cy={y - 6} r="1.4" fill="var(--accent)" opacity="0.95" />
    </g>
  );
}

function Caption({ children }: { children: string }) {
  return (
    <text
      x="60"
      y="86"
      textAnchor="middle"
      fontSize="6"
      fill="var(--muted-foreground)"
      fontFamily="monospace"
    >
      {children}
    </text>
  );
}

/** Flat diametric disc: clean N/S semicircles (top-down). */
function DiametricDisc({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      {/* South half */}
      <path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
        fill="#2980b9"
      />
      {/* North half */}
      <path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`}
        fill="#c0392b"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="0.6"
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
        x={cx - r * 0.42}
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
        x={cx + r * 0.42}
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
  );
}

/** Simple axial cylinder drawn upright (side view). */
function AxialCylinderSide({
  cx,
  top,
  w,
  h,
  uid,
}: {
  cx: number;
  top: number;
  w: number;
  h: number;
  uid: string;
}) {
  const rx = w / 2;
  const ry = Math.max(2.2, w * 0.18);
  return (
    <g>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3498db" />
          <stop offset="55%" stopColor="#c0392b" />
          <stop offset="100%" stopColor="#922b21" />
        </linearGradient>
      </defs>
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill="#5dade2" />
      <rect x={cx - rx} y={top} width={w} height={h} fill={`url(#${uid})`} />
      <ellipse cx={cx} cy={top + h} rx={rx} ry={ry} fill="#c0392b" />
      <ellipse
        cx={cx}
        cy={top + h}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="0.5"
      />
    </g>
  );
}

export function DynamicPreview({ id }: { id: string }) {
  if (id === "angle-encoding") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20" aria-hidden>
        <SensorChip x={60} y={72} />
        {/* Soft ground plane under disc */}
        <ellipse
          cx="60"
          cy="44"
          rx="20"
          ry="5.5"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.5"
          strokeDasharray="2.5 2.5"
          opacity="0.28"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 38"
            to="360 60 38"
            dur="2.6s"
            repeatCount="indefinite"
          />
          <DiametricDisc cx={60} cy={38} r={16} />
        </g>
        {/* Air-gap hint */}
        <line
          x1="60"
          y1="54"
          x2="60"
          y2="65"
          stroke="var(--accent)"
          strokeWidth="0.7"
          strokeDasharray="2 2"
          opacity="0.45"
        />
        <Caption>360° spin</Caption>
      </svg>
    );
  }

  if (id === "slide-by") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20" aria-hidden>
        <SensorChip x={60} y={58} />
        <line
          x1="12"
          y1="34"
          x2="108"
          y2="34"
          stroke="var(--accent)"
          strokeWidth="0.5"
          strokeDasharray="3 3"
          opacity="0.3"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-42,0; 42,0; -42,0"
            dur="2.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <AxialCylinderSide cx={60} top={22} w={16} h={14} uid="pv-slide-cyl" />
        </g>
        <Caption>lateral slide-by</Caption>
      </svg>
    );
  }

  if (id === "incremental-encoding") {
    const cx = 60;
    const cy = 38;
    const rOut = 18;
    const rIn = 10;
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20" aria-hidden>
        <SensorChip x={60} y={72} />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 38"
            to="360 60 38"
            dur="2.2s"
            repeatCount="indefinite"
          />
          {/* Outer ring body */}
          <circle cx={cx} cy={cy} r={rOut} fill="#2c3e50" />
          {/* Diametric halves on the ring annulus */}
          <path
            d={`M ${cx} ${cy - rOut}
                A ${rOut} ${rOut} 0 0 0 ${cx} ${cy + rOut}
                L ${cx} ${cy + rIn}
                A ${rIn} ${rIn} 0 0 1 ${cx} ${cy - rIn} Z`}
            fill="#c0392b"
          />
          <path
            d={`M ${cx} ${cy - rOut}
                A ${rOut} ${rOut} 0 0 1 ${cx} ${cy + rOut}
                L ${cx} ${cy + rIn}
                A ${rIn} ${rIn} 0 0 0 ${cx} ${cy - rIn} Z`}
            fill="#2980b9"
          />
          <circle cx={cx} cy={cy} r={rIn} fill="var(--card)" />
          <circle
            cx={cx}
            cy={cy}
            r={rOut}
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="0.6"
          />
          <circle
            cx={cx}
            cy={cy}
            r={rIn}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
          />
        </g>
        <Caption>ring rotation</Caption>
      </svg>
    );
  }

  if (id === "head-on") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20" aria-hidden>
        <SensorChip x={60} y={74} />
        <line
          x1="60"
          y1="14"
          x2="60"
          y2="68"
          stroke="var(--accent)"
          strokeWidth="0.5"
          strokeDasharray="3 3"
          opacity="0.28"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,22; 0,0"
            dur="2.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <AxialCylinderSide cx={60} top={12} w={22} h={16} uid="pv-head-cyl" />
        </g>
        <Caption>axial approach</Caption>
      </svg>
    );
  }

  if (id === "lid-closure") {
    const pivotX = 28;
    const pivotY = 58;
    const arm = 48;
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20" aria-hidden>
        {/* Arc guide ~35° */}
        <path
          d={`M ${pivotX + arm} ${pivotY}
              A ${arm} ${arm} 0 0 0 ${pivotX + arm * Math.cos((35 * Math.PI) / 180)} ${
                pivotY - arm * Math.sin((35 * Math.PI) / 180)
              }`}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.55"
          strokeDasharray="2.5 2.5"
          opacity="0.35"
        />
        <circle cx={pivotX} cy={pivotY} r="2.4" fill="var(--muted-foreground)" />
        <SensorChip x={92} y={50} face="left" />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="-35 28 58"
            to="0 28 58"
            dur="1.6s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.55 0 0.35 1"
          />
          <line
            x1={pivotX}
            y1={pivotY}
            x2={pivotX + arm - 8}
            y2={pivotY}
            stroke="var(--muted-foreground)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Small axial cylinder at arm tip, side-on */}
          <g transform={`translate(${pivotX + arm - 4}, ${pivotY - 7})`}>
            <ellipse cx="0" cy="0" rx="5" ry="2" fill="#5dade2" />
            <rect x="-5" y="0" width="10" height="10" fill="#c0392b" />
            <ellipse cx="0" cy="10" rx="5" ry="2" fill="#922b21" />
          </g>
        </g>
        <Caption>35° hinge arc</Caption>
      </svg>
    );
  }

  return null;
}
