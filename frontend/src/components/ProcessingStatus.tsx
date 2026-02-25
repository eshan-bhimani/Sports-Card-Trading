"use client";

export type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error";

interface ProcessingStatusProps {
  state: ProcessingState;
  error?: string | null;
}

const stateConfig: Record<
  ProcessingState,
  { label: string; sublabel: string; iconColor: string; dotColor: string }
> = {
  idle: { label: "", sublabel: "", iconColor: "", dotColor: "" },
  uploading: {
    label: "Uploading image...",
    sublabel: "Sending to server",
    iconColor: "text-blue-400",
    dotColor: "bg-blue-400",
  },
  processing: {
    label: "Detecting card...",
    sublabel: "Cropping & orienting",
    iconColor: "text-amber-400",
    dotColor: "bg-amber-400",
  },
  complete: {
    label: "Card processed!",
    sublabel: "Ready to download",
    iconColor: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  error: {
    label: "Processing failed",
    sublabel: "",
    iconColor: "text-red-400",
    dotColor: "bg-red-400",
  },
};

export default function ProcessingStatus({ state, error }: ProcessingStatusProps) {
  if (state === "idle") return null;

  const config = stateConfig[state];
  const isActive = state === "uploading" || state === "processing";

  return (
    <div
      className={`
        glass-hero rounded-xl px-5 py-3.5 w-full
        flex items-center gap-3.5
        transition-all duration-300
        ${isActive ? "processing-glow" : ""}
      `}
    >
      {/* Status indicator */}
      <div className="flex-shrink-0">
        {isActive && (
          <div className="w-8 h-8 relative">
            <svg className="w-8 h-8 spinner" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-15"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                className={config.iconColor}
                d="M12 2a10 10 0 019.75 7.75"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
        {state === "complete" && (
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {state === "error" && (
          <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-sm ${config.iconColor}`}>{config.label}</p>
        <p className="text-white/30 text-xs mt-0.5 truncate">
          {state === "error" && error ? error : config.sublabel}
        </p>
      </div>

      {/* Live dot */}
      {isActive && (
        <div className="flex-shrink-0">
          <span className={`block w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
        </div>
      )}
    </div>
  );
}
