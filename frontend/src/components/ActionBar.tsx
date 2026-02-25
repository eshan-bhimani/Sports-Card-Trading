"use client";

interface ActionBarProps {
  processedUrl: string | null;
  onReset: () => void;
  isProcessing: boolean;
}

export default function ActionBar({ processedUrl, onReset, isProcessing }: ActionBarProps) {
  const hasResult = !!processedUrl && !isProcessing;

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = `card-cropped-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-3">
      {/* Primary actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={!hasResult}
          className={`
            flex-1 py-3.5 rounded-xl font-semibold text-sm
            flex items-center justify-center gap-2
            transition-all duration-300
            ${
              hasResult
                ? "btn-cta active:scale-[0.97]"
                : "glass text-white/20 cursor-not-allowed"
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={onReset}
          className="
            flex-1 py-3.5 rounded-xl font-semibold text-sm
            btn-glass active:scale-[0.97]
            flex items-center justify-center gap-2
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Upload Another
        </button>
      </div>

      {/* Coming soon actions */}
      <div className="flex gap-3">
        <button
          disabled
          className="
            flex-1 py-2.5 rounded-xl text-xs
            bg-white/[0.02] border border-white/[0.05]
            text-white/20 cursor-not-allowed
            flex flex-col items-center justify-center gap-0.5
          "
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Google Photos
          </div>
          <span className="text-[9px] text-white/10">Coming Soon</span>
        </button>
        <button
          disabled
          className="
            flex-1 py-2.5 rounded-xl text-xs
            bg-white/[0.02] border border-white/[0.05]
            text-white/20 cursor-not-allowed
            flex flex-col items-center justify-center gap-0.5
          "
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.82-4 4.02-4h.47C7.31 7.55 9.46 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z" />
            </svg>
            Google Cloud
          </div>
          <span className="text-[9px] text-white/10">Coming Soon</span>
        </button>
      </div>
    </div>
  );
}
