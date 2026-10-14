import { useState } from "react";
import {
  downloadSimulationCsv,
  downloadSimulationPdf,
  type SimulationExportContext,
} from "../../lib/exportSimulation";

export function ExportButtons({
  context,
}: {
  context: SimulationExportContext | null;
}) {
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!context || context.dataset.length === 0) return null;

  const frames = context.dataset.length;
  const part = context.sensorPackage.partNumber;

  const onCsv = () => {
    setError(null);
    setBusy("csv");
    try {
      downloadSimulationCsv(context);
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV export failed");
    } finally {
      setBusy(null);
    }
  };

  const onPdf = async () => {
    setError(null);
    setBusy("pdf");
    try {
      await downloadSimulationPdf(context);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="rounded-sm p-3 space-y-2.5"
      style={{
        border: "1px solid var(--border)",
        backgroundColor:
          "color-mix(in srgb, var(--background) 55%, transparent)",
      }}
      role="region"
      aria-label="Download simulation results"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="font-mono text-xs uppercase tracking-wide"
            style={{ color: "var(--accent)" }}
          >
            Download results
          </div>
          <p
            className="font-mono text-xs mt-1 leading-snug truncate"
            style={{ color: "var(--muted-foreground)" }}
            title={`${part} · ${frames} frames · field + output data`}
          >
            {part} · {frames} frames · field + output
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy != null}
          onClick={onCsv}
          className="text-left rounded-sm px-3 py-2.5 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <div
            className="font-mono text-[12px] uppercase tracking-wide font-semibold leading-snug"
            style={{ color: "var(--foreground)" }}
          >
            {busy === "csv" ? "Preparing…" : "CSV spreadsheet"}
          </div>
          <div
            className="font-mono text-xs mt-1 leading-snug"
            style={{ color: "var(--muted-foreground)" }}
          >
            Full frame table for Excel
          </div>
        </button>

        <button
          type="button"
          disabled={busy != null}
          onClick={() => void onPdf()}
          className="text-left rounded-sm px-3 py-2.5 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
          style={{
            borderColor:
              "color-mix(in srgb, var(--accent) 50%, var(--border))",
            backgroundColor:
              "color-mix(in srgb, var(--accent) 10%, var(--card))",
          }}
        >
          <div
            className="font-mono text-[12px] uppercase tracking-wide font-semibold leading-snug"
            style={{ color: "var(--accent)" }}
          >
            {busy === "pdf" ? "Preparing…" : "PDF report"}
          </div>
          <div
            className="font-mono text-xs mt-1 leading-snug"
            style={{ color: "var(--muted-foreground)" }}
          >
            Setup summary + data table
          </div>
        </button>
      </div>

      {error && (
        <p className="font-mono text-xs text-red-400 leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
}
