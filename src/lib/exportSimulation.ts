import type { FieldSample, ChartXMode } from "./fieldMath";
import { chartXLabel, chartXUnit } from "./fieldMath";
import type { SensorPackageInfo } from "../types/simulation";
import type { AnimationParams, MagnetParams } from "../store/simulatorStore";
import {
  HALLSIM_DISCLAIMER_LINES,
  HALLSIM_DISCLAIMER_SHORT,
} from "./disclaimer";

export interface SimulationExportContext {
  dataset: FieldSample[];
  sensorPackage: SensorPackageInfo;
  xMode: ChartXMode;
  fps: number;
  duration: number;
  magnet: MagnetParams;
  animation: AnimationParams;
  supplyV: number;
  presetLabel?: string | null;
}

function stamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function safeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_|_$/g, "") || "sim";
}

export function exportBasename(ctx: SimulationExportContext): string {
  const part = safeFilenamePart(ctx.sensorPackage.partNumber);
  return `HallSim_${part}_${stamp()}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function summaryStats(dataset: FieldSample[]) {
  return {
    peakB: Math.max(...dataset.map((d) => d.btotal)),
    minB: Math.min(...dataset.map((d) => d.btotal)),
    vmax: Math.max(...dataset.map((d) => d.vout)),
    vmin: Math.min(...dataset.map((d) => d.vout)),
  };
}

/** jsPDF Helvetica is WinAnsi — strip fancy unicode that becomes mojibake. */
function pdfSafe(text: string): string {
  return text
    .replace(/\u2192/g, "->") // →
    .replace(/\u00B7/g, "-") // ·
    .replace(/\u2013|\u2014/g, "-") // – —
    .replace(/\u00B0/g, " deg") // °
    .replace(/\u03B1/g, "alpha") // α
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"');
}

function motionSummary(animation: AnimationParams): string {
  if (animation.type === "linear") {
    const s = animation.startPosition;
    const e = animation.endPosition;
    return `linear (${s.x},${s.y},${s.z}) -> (${e.x},${e.y},${e.z}) mm`;
  }
  if (animation.type === "rotate") {
    return `rotate about ${animation.axis} ${animation.startAngle} deg -> ${animation.endAngle} deg`;
  }
  return `hinge ${animation.axis} arm ${animation.armLength} mm ${animation.startAngle} deg -> ${animation.endAngle} deg${animation.bounce ? " bounce" : ""}`;
}

/** Full frame table as CSV (UTF-8 with BOM for Excel). */
export function downloadSimulationCsv(ctx: SimulationExportContext): void {
  const xUnit = chartXUnit(ctx.xMode);
  const xHeader = ctx.xMode === "displacement" ? "displacement_mm" : "angle_deg";
  const headers = [
    "frame",
    "time_s",
    xHeader,
    "bx_G",
    "by_G",
    "bz_G",
    "btotal_G",
    "vout_V",
    "code",
  ];

  const meta = [
    `# HallSim simulation export`,
    `# Generated,${new Date().toISOString()}`,
    `# Part,${csvEscape(ctx.sensorPackage.partNumber)}`,
    `# Hall type,${ctx.sensorPackage.hallType}`,
    `# Supply VDD (V),${ctx.supplyV}`,
    `# Sensing axis,${ctx.sensorPackage.sensingAxis}`,
    `# Motion,${csvEscape(motionSummary(ctx.animation))}`,
    `# Magnet,${ctx.magnet.shape} Br=${ctx.magnet.remanence} T ${ctx.magnet.materialGrade}`,
    `# Temperature (°C),${ctx.magnet.temperature}`,
    `# Temp coeff (%/°C),${ctx.magnet.tempCoefficient}`,
    `# Poles,${ctx.magnet.poles}`,
    `# Duration (s),${ctx.duration}`,
    `# Sample rate (fps),${ctx.fps}`,
    `# Chart X,${chartXLabel(ctx.xMode)} (${xUnit})`,
    `# Frames,${ctx.dataset.length}`,
    `#`,
    ...HALLSIM_DISCLAIMER_LINES.map((line) => `# ${line}`),
    `#`,
  ];

  const rows = ctx.dataset.map((row, i) =>
    [
      i,
      row.t,
      row.x,
      row.bx,
      row.by,
      row.bz,
      row.btotal,
      row.vout,
      row.code,
    ]
      .map(csvEscape)
      .join(","),
  );

  const body = [...meta, headers.join(","), ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF", body], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `${exportBasename(ctx)}.csv`);
}

/** Branded PDF summary + frame table (lazy-loads jspdf). */
export async function downloadSimulationPdf(
  ctx: SimulationExportContext,
): Promise<void> {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableMod.default;
  const stats = summaryStats(ctx.dataset);
  const xUnit = chartXUnit(ctx.xMode);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 90, 156);
  doc.text("Diodes Incorporated", margin, y);
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("HallSim — Simulation Report", margin, y);
  y += 8;

  doc.setDrawColor(0, 90, 156);
  doc.setLineWidth(0.4);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const pkg = ctx.sensorPackage;
  const metaRows: [string, string][] = [
    ["Generated", new Date().toLocaleString()],
    [
      "Part",
      `${pkg.partNumber} / ${pkg.hallType} / sense ${pkg.sensingAxis.toUpperCase()}`,
    ],
    ["Description", pkg.description],
    ["Supply VDD", `${ctx.supplyV.toFixed(2)} V`],
  ];
  if (pkg.bopTypGauss != null) {
    metaRows.push([
      "Thresholds",
      `Bop ${pkg.bopTypGauss} G / Brp ${pkg.brpTypGauss ?? "-"} G`,
    ]);
  }
  metaRows.push(
    ["Preset", ctx.presetLabel ?? "Custom"],
    [
      "Magnet",
      `${ctx.magnet.shape} / ${ctx.magnet.materialGrade} / Br ${ctx.magnet.remanence} T / poles ${ctx.magnet.poles}`,
    ],
    [
      "Thermal",
      `${ctx.magnet.temperature} deg C / temp coeff ${ctx.magnet.tempCoefficient} %/deg C`,
    ],
    ["Motion", motionSummary(ctx.animation)],
    [
      "Run",
      `${ctx.duration} s @ ${ctx.fps} fps / ${ctx.dataset.length} frames`,
    ],
    ["Chart X", `${chartXLabel(ctx.xMode)} (${xUnit})`],
  );

  const labelWidth = 28;
  const valueWidth = 210 - margin * 2 - labelWidth;
  for (const [label, value] of metaRows) {
    doc.setFont("helvetica", "bold");
    doc.text(pdfSafe(`${label}:`), margin, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(pdfSafe(value), valueWidth);
    doc.text(wrapped, margin + labelWidth, y);
    y += Math.max(1, wrapped.length) * 4.2;
  }

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 90, 156);
  doc.text("Disclaimer", margin, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  {
    const wrapped = doc.splitTextToSize(
      pdfSafe(HALLSIM_DISCLAIMER_SHORT),
      210 - margin * 2,
    );
    doc.text(wrapped, margin, y);
    y += wrapped.length * 3.6 + 3;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 90, 156);
  doc.text("Summary", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(
    pdfSafe(
      `Peak |B| ${stats.peakB.toFixed(1)} G  /  Min |B| ${stats.minB.toFixed(1)} G  /  Vout ${stats.vmin.toFixed(3)}-${stats.vmax.toFixed(3)} V`,
    ),
    margin,
    y,
  );
  y += 8;

  const head = [
    [
      "Fr",
      `t (s)`,
      `X (${xUnit})`,
      "Bx (G)",
      "By (G)",
      "Bz (G)",
      "|B| (G)",
      "Vout (V)",
      "Code",
    ],
  ];
  const body = ctx.dataset.map((row, i) => [
    String(i),
    row.t.toFixed(4),
    row.x.toFixed(xUnit === "deg" ? 1 : 2),
    row.bx.toFixed(2),
    row.by.toFixed(2),
    row.bz.toFixed(2),
    row.btotal.toFixed(2),
    row.vout.toFixed(4),
    String(row.code),
  ]);

  autoTable(doc, {
    startY: y,
    head,
    body,
    styles: {
      fontSize: 7,
      cellPadding: 1.1,
      font: "helvetica",
    },
    headStyles: {
      fillColor: [0, 90, 156],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [240, 246, 252] },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      const page = doc.getNumberOfPages();
      doc.setPage(page);
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "HallSim · Magpylib ideal-magnet model · evaluation only · CSV also available",
        margin,
        297 - 8,
      );
      doc.text(`Page ${page}`, 210 - margin, 297 - 8, { align: "right" });
      void data;
    },
  });

  doc.save(`${exportBasename(ctx)}.pdf`);
}
