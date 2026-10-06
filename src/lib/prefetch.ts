/**
 * Prefetch heavy workspace chunks without touching the URL.
 * Safe to call on hover / idle while still on the presets view.
 */
export function prefetchDesignWorkspace(): void {
  void import("../pages/DesignPage");
}

export function prefetchCustomSetup(): void {
  void import("../components/simulator/scene/CustomSetupFlow");
}
