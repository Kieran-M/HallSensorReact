/** Per-chart X-domain zoom helpers (field / output are independent). */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from "react";

export type XDomain = [number, number];

export function fullXDomain(
  xs: ReadonlyArray<{ x: number }>,
): XDomain | null {
  if (xs.length === 0) return null;
  let min = xs[0]!.x;
  let max = xs[0]!.x;
  for (let i = 1; i < xs.length; i++) {
    const v = xs[i]!.x;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === max) return [min, min + 1e-6];
  return [min, max];
}

export function clampDomain(domain: XDomain, full: XDomain): XDomain {
  const [f0, f1] = full;
  const span = f1 - f0;
  let [a, b] = domain[0] <= domain[1] ? domain : [domain[1], domain[0]];
  a = Math.max(f0, Math.min(a, f1));
  b = Math.max(f0, Math.min(b, f1));
  if (b - a < span * 0.02) {
    const mid = (a + b) / 2;
    const half = (span * 0.02) / 2;
    a = mid - half;
    b = mid + half;
  }
  if (a < f0) {
    b += f0 - a;
    a = f0;
  }
  if (b > f1) {
    a -= b - f1;
    b = f1;
  }
  return [Math.max(f0, a), Math.min(f1, b)];
}

/** Zoom toward `anchor` (defaults to window center). factor <1 zooms in. */
export function zoomDomain(
  current: XDomain,
  full: XDomain,
  factor: number,
  anchor?: number,
): XDomain {
  const [a, b] = current;
  const mid = anchor ?? (a + b) / 2;
  const t = b === a ? 0.5 : (mid - a) / (b - a);
  const nextSpan = (b - a) * factor;
  return clampDomain([mid - nextSpan * t, mid + nextSpan * (1 - t)], full);
}

/** Pan by a fraction of the current window (−1…1). */
export function panDomain(
  current: XDomain,
  full: XDomain,
  fraction: number,
): XDomain {
  const [a, b] = current;
  const delta = (b - a) * fraction;
  return clampDomain([a + delta, b + delta], full);
}

export function domainsEqual(
  a: XDomain | null,
  b: XDomain | null,
  eps = 1e-9,
): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps;
}

type ChartMouseState = { activeLabel?: string | number } | null;

/** Independent drag / wheel / button zoom for one chart. */
export function useChartZoom(dataset: ReadonlyArray<{ x: number }>) {
  const full = useMemo(() => fullXDomain(dataset), [dataset]);
  const [xDomain, setXDomain] = useState<XDomain | null>(null);
  const [selectLeft, setSelectLeft] = useState<number | null>(null);
  const [selectRight, setSelectRight] = useState<number | null>(null);
  const selecting = useRef(false);
  const lastHoverX = useRef<number | null>(null);

  useEffect(() => {
    setXDomain(null);
    setSelectLeft(null);
    setSelectRight(null);
    selecting.current = false;
    lastHoverX.current = null;
  }, [dataset]);

  const activeDomain: XDomain | null = xDomain ?? full;
  const zoomed =
    full != null && xDomain != null && !domainsEqual(xDomain, full);

  const applyDomain = (next: XDomain | null) => {
    if (!full || next == null) {
      setXDomain(null);
      return;
    }
    const clamped = clampDomain(next, full);
    setXDomain(domainsEqual(clamped, full) ? null : clamped);
  };

  const onZoomIn = () => {
    if (!full || !activeDomain) return;
    applyDomain(zoomDomain(activeDomain, full, 0.7, lastHoverX.current ?? undefined));
  };
  const onZoomOut = () => {
    if (!full || !activeDomain) return;
    applyDomain(
      zoomDomain(activeDomain, full, 1 / 0.7, lastHoverX.current ?? undefined),
    );
  };
  const onPanLeft = () => {
    if (!full || !activeDomain) return;
    applyDomain(panDomain(activeDomain, full, -0.25));
  };
  const onPanRight = () => {
    if (!full || !activeDomain) return;
    applyDomain(panDomain(activeDomain, full, 0.25));
  };
  const onReset = () => applyDomain(null);

  const onWheel = (e: WheelEvent) => {
    if (!full || !activeDomain || dataset.length < 2) return;
    e.preventDefault();
    e.stopPropagation();
    applyDomain(
      zoomDomain(
        activeDomain,
        full,
        e.deltaY > 0 ? 1.15 : 0.85,
        lastHoverX.current ?? undefined,
      ),
    );
  };

  const finishSelect = () => {
    if (
      selectLeft != null &&
      selectRight != null &&
      Math.abs(selectLeft - selectRight) > 1e-12
    ) {
      applyDomain([selectLeft, selectRight]);
    }
    selecting.current = false;
    setSelectLeft(null);
    setSelectRight(null);
  };

  const chartHandlers = {
    onMouseDown: (state: ChartMouseState) => {
      if (state?.activeLabel == null) return;
      selecting.current = true;
      const v = Number(state.activeLabel);
      setSelectLeft(v);
      setSelectRight(v);
    },
    onMouseMove: (state: ChartMouseState) => {
      if (state?.activeLabel != null) {
        lastHoverX.current = Number(state.activeLabel);
      }
      if (!selecting.current || state?.activeLabel == null) return;
      setSelectRight(Number(state.activeLabel));
    },
    onMouseUp: finishSelect,
    onDoubleClick: onReset,
  };

  const selectRange =
    selectLeft != null &&
    selectRight != null &&
    selectLeft !== selectRight
      ? ([
          Math.min(selectLeft, selectRight),
          Math.max(selectLeft, selectRight),
        ] as XDomain)
      : null;

  return {
    domain: activeDomain,
    zoomed,
    onZoomIn,
    onZoomOut,
    onPanLeft,
    onPanRight,
    onReset,
    onWheel,
    chartHandlers,
    selectRange,
  };
}
