"use client";

export type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error";

interface ProcessingStatusProps {
  state: ProcessingState;
  error?: string | null;
}

const stateConfig: Record<
  ProcessingState,
  { label: string; sublabel: string; color: string; bgColor: string }
> = {
  idle: { label: "", sublabel: "", color: "", bgColor: "" },
  uploading: {
    label: "Uploading image...",
    sublabel: "Sending to server",
    color: "text-[#8b5cf6]",
    bgColor: "bg-[#8b5cf6]/10",
  },
  processing: {
    label: "Processing card...",
    sublabel: "Detecting and cropping",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  complete: {
    label: "Done!",
    sublabel: "Card processed successfully",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  error: {
    label: "Processing failed",
    sublabel: "",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
};

export default function ProcessingStatus({ state, error }: ProcessingStatusProps) {
  if (state === "idle") return null;

  const config = stateConfig[state];
  const isActive = state === "uploading" || state === "processing";

  return (
    <div
      className={`
        surface rounded-lg px-4 py-3 w-full
        flex items-center gap-3
        ${isActive ? "processing-glow" : ""}
      `}
    >
      {/* Status indicator */}
      <div className="flex-shrink-0">
        {isActive && (
          <div className="w-7 h-7 relative">
            <svg className="w-7 h-7 spinner" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-10"
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
          <div className={`w-7 h-7 rounded-md ${config.bgColor} flex items-center justify-center`}>
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {state === "error" && (
          <div className={`w-7 h-7 rounded-md ${config.bgColor} flex items-center justify-center`}>
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`font-medium text-sm ${config.color}`}>{config.label}</p>
        <p className="text-[#52525b] text-xs mt-0.5 truncate">
          {state === "error" && error ? error : config.sublabel}
        </p>
      </div>
    </div>
  );
}
