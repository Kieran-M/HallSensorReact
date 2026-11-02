/**
 * Shared Magpylib / evaluation disclaimers for UI, CSV, and PDF.
 * Keep wording consistent across surfaces.
 */

export const HALLSIM_DISCLAIMER_SHORT =
  "Magnetic fields computed with Magpylib (ideal permanent magnets). For evaluation and design exploration only - not a substitute for laboratory characterization or datasheet guarantees.";

/** Multi-line form for CSV comment headers and PDF body (ASCII-safe for jsPDF). */
export const HALLSIM_DISCLAIMER_LINES = [
  "DISCLAIMER: HallSim magnetic field results are generated using Magpylib,",
  "an open-source ideal-magnet model (uniform polarization). Sensor output uses",
  "typical catalog sensitivity or Bop/Brp thresholds with a simplified rail model.",
  "Temperature adjusts Br with a linear coefficient only. Package die offsets,",
  "soft iron, shielding, and PCB effects are not modelled. Results are for",
  "evaluation / design exploration - not lab characterization, production",
  "qualification, or a substitute for datasheet guarantees.",
] as const;

export const HALLSIM_DISCLAIMER_FULL = HALLSIM_DISCLAIMER_LINES.join(" ");
