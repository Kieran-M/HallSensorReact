/** Animated SVG motion sketches for the preset landing cards. */

// Animated SVG preview unique to each preset's physical motion
export function DynamicPreview({ id }: { id: string }) {
  if (id === 'angle-encoding') {
    // Disc magnet rotating above a fixed sensor
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor PCB */}
        <rect x="47" y="72" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="68" width="8" height="5" rx="0.5" fill="#111" />
        {/* Sensor axis dot */}
        <circle cx="60" cy="66" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Orbit path ghost */}
        <ellipse cx="60" cy="42" rx="22" ry="6" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
        {/* Rotating disc */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 60 42" to="360 60 42" dur="2.4s" repeatCount="indefinite" />
          <ellipse cx="60" cy="42" rx="14" ry="5" fill="#c0392b" opacity="0.95" />
          <ellipse cx="60" cy="42" rx="7" ry="5" fill="#2980b9" opacity="0.9" />
          {/* Field line */}
          <line x1="60" y1="47" x2="60" y2="65" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.4s" repeatCount="indefinite" />
          </line>
        </g>
        {/* Label */}
        <text x="60" y="86" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">360° rotation</text>
      </svg>
    )
  }

  if (id === 'slide-by') {
    // Bar magnet translating laterally past sensor
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor */}
        <rect x="47" y="52" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="48" width="8" height="5" rx="0.5" fill="#111" />
        <circle cx="60" cy="46" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Sliding bar magnet */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="-50,0; 50,0; -50,0" dur="2.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
          <rect x="33" y="30" width="18" height="10" rx="1" fill="#c0392b" />
          <rect x="51" y="30" width="18" height="10" rx="1" fill="#2980b9" />
          <text x="42" y="38" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="monospace" fontWeight="bold">N</text>
          <text x="60" y="38" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="monospace" fontWeight="bold">S</text>
          {/* Field lines */}
          {[-6, 0, 6].map((dx, i) => (
            <line key={i} x1={60 + dx} y1="41" x2={60 + dx} y2="47" stroke="var(--accent)" strokeWidth="0.7" opacity="0.4">
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite" />
            </line>
          ))}
        </g>
        <text x="60" y="70" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">lateral translation</text>
      </svg>
    )
  }

  if (id === 'incremental-encoding') {
    // Multi-pole ring rotating
    const poles = 8
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor */}
        <rect x="47" y="72" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="68" width="8" height="5" rx="0.5" fill="#111" />
        <circle cx="60" cy="66" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Rotating ring */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 60 42" to="360 60 42" dur="1.8s" repeatCount="indefinite" />
          {Array.from({ length: poles }, (_, i) => {
            const angle = (i / poles) * 2 * Math.PI
            const nextAngle = ((i + 1) / poles) * 2 * Math.PI
            const r = 20
            const x1 = 60 + r * Math.cos(angle)
            const y1 = 42 + r * Math.sin(angle)
            const x2 = 60 + r * Math.cos(nextAngle)
            const y2 = 42 + r * Math.sin(nextAngle)
            const largeArc = 1 / poles > 0.5 ? 1 : 0
            return (
              <path
                key={i}
                d={`M ${60 + 14 * Math.cos(angle)} ${42 + 14 * Math.sin(angle)}
                    A 14 14 0 ${largeArc} 1 ${60 + 14 * Math.cos(nextAngle)} ${42 + 14 * Math.sin(nextAngle)}
                    L ${x2} ${y2}
                    A 20 20 0 ${largeArc} 0 ${x1} ${y1} Z`}
                fill={i % 2 === 0 ? '#c0392b' : '#2980b9'}
                opacity="0.9"
              />
            )
          })}
          {/* Center hole */}
          <circle cx="60" cy="42" r="14" fill="var(--background)" />
          <circle cx="60" cy="42" r="3" fill="var(--muted)" />
        </g>
        <text x="60" y="86" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">quadrature output</text>
      </svg>
    )
  }

  if (id === 'head-on') {
    // Cylinder descending toward sensor
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Sensor */}
        <rect x="47" y="74" width="26" height="7" rx="1" fill="#1a3a2a" />
        <rect x="56" y="70" width="8" height="5" rx="0.5" fill="#111" />
        <circle cx="60" cy="68" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Descending cylinder */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,-20; 0,18; 0,-20" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
          <ellipse cx="60" cy="28" rx="12" ry="4" fill="#2980b9" />
          <rect x="48" y="28" width="24" height="16" fill="url(#cyl-grad)" />
          <ellipse cx="60" cy="44" rx="12" ry="4" fill="#c0392b" />
          <defs>
            <linearGradient id="cyl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2980b9" />
              <stop offset="100%" stopColor="#c0392b" />
            </linearGradient>
          </defs>
          {/* Field lines below */}
          {[-6, 0, 6].map((dx, i) => (
            <line key={i} x1={60 + dx} y1="48" x2={60 + dx} y2="58" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.05;0.5" dur="2.2s" repeatCount="indefinite" />
            </line>
          ))}
        </g>
        <text x="60" y="86" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">axial approach</text>
      </svg>
    )
  }

  if (id === 'lid-closure') {
    // Block swinging on a hinge
    return (
      <svg viewBox="0 0 120 90" className="w-full h-20">
        {/* Hinge point */}
        <circle cx="30" cy="56" r="2.5" fill="var(--muted-foreground)" />
        {/* Sensor on right */}
        <rect x="78" y="52" width="18" height="6" rx="1" fill="#1a3a2a" />
        <rect x="83" y="48" width="7" height="5" rx="0.5" fill="#111" />
        <circle cx="86" cy="46" r="1.5" fill="var(--accent)" opacity="0.9" />
        {/* Swinging lid arm */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="-60 30 56" to="0 30 56" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0 0.4 1" additive="replace" />
          <line x1="30" y1="56" x2="72" y2="56" stroke="var(--muted-foreground)" strokeWidth="1.5" />
          {/* Block magnet at end */}
          <rect x="62" y="49" width="18" height="7" rx="1" fill="#c0392b" />
          <rect x="71" y="49" width="9" height="7" rx="1" fill="#2980b9" />
          <text x="67" y="55" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="monospace" fontWeight="bold">N</text>
          <text x="76" y="55" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="monospace" fontWeight="bold">S</text>
        </g>
        <text x="60" y="75" textAnchor="middle" fontSize="6" fill="var(--muted-foreground)" fontFamily="monospace">hinge sweep</text>
      </svg>
    )
  }

  return null
}

