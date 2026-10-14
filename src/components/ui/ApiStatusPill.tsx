import { useApiHealth } from "../../hooks/useApiHealth";

/** Compact API reachability indicator for landing + workspace headers. */
export function ApiStatusPill({ compact = false }: { compact?: boolean }) {
  const { status, packages, apiUrl, refresh } = useApiHealth();

  if (status === "checking") {
    return (
      <div
        className="flex items-center gap-1.5"
        title={`Checking ${apiUrl}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        {!compact && (
          <span className="font-mono text-sm uppercase tracking-widest text-amber-400">
            Connecting
          </span>
        )}
      </div>
    );
  }

  if (status === "ok") {
    return (
      <div
        className="flex items-center gap-1.5"
        title={`${apiUrl}${packages != null ? ` · ${packages} packages` : ""}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {!compact && (
          <span className="font-mono text-sm uppercase tracking-widest text-emerald-400">
            API Ready
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={refresh}
      className="flex items-center gap-1.5 cursor-pointer shrink-0"
      title={`Cannot reach ${apiUrl}. Click to retry.`}
      aria-label="API offline — click to retry"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
      {!compact && (
        <span className="font-mono text-[12px] uppercase tracking-wide text-red-400">
          API Offline
        </span>
      )}
    </button>
  );
}
