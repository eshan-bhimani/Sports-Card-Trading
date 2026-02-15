"use client";

export type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error";

interface ProcessingStatusProps {
  state: ProcessingState;
  error?: string | null;
}

const stateConfig: Record<
  ProcessingState,
  { label: string; sublabel: string; color: string }
> = {
  idle: { label: "", sublabel: "", color: "" },
  uploading: {
    label: "Uploading image...",
    sublabel: "Sending to server",
    color: "text-blue-400",
  },
  processing: {
    label: "Processing card...",
    sublabel: "Detecting and cropping",
    color: "text-amber-400",
  },
  complete: {
    label: "Done!",
    sublabel: "Card processed successfully",
    color: "text-emerald-400",
  },
  error: {
    label: "Processing failed",
    sublabel: "",
    color: "text-red-400",
  },
};

export default function ProcessingStatus({ state, error }: ProcessingStatusProps) {
  if (state === "idle") return null;

  const config = stateConfig[state];
  const isActive = state === "uploading" || state === "processing";

  return (
    <div
      className={`
        glass rounded-xl px-5 py-4 w-full fade-in
        flex items-center gap-4
        ${isActive ? "processing-glow" : ""}
      `}
    >
      {/* Status indicator */}
      <div className="flex-shrink-0">
        {isActive && (
          <div className="w-8 h-8 relative">
            <svg className="w-8 h-8 spinner" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={config.color}
                d="M12 2a10 10 0 019.75 7.75"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
        {state === "complete" && (
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {state === "error" && (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`font-medium text-sm ${config.color}`}>{config.label}</p>
        <p className="text-white/40 text-xs mt-0.5 truncate">
          {state === "error" && error ? error : config.sublabel}
        </p>
      </div>
    </div>
  );
}
