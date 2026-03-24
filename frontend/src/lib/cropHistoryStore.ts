export interface CropHistoryItem {
  id: string;
  originalThumbnail: string; // base64 JPEG data URL
  croppedThumbnail: string;  // base64 JPEG data URL
  confidence: number;
  playerName?: string;
  timestamp: number;
}

const MAX_HISTORY = 20;
const STORAGE_KEY = "cropHistory";

export function loadHistory(): CropHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CropHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<CropHistoryItem, "id" | "timestamp">): void {
  const history = loadHistory();
  const next: CropHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const trimmed = [next, ...history].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full — drop the oldest item and retry
    const shorter = [next, ...history].slice(0, MAX_HISTORY - 1);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shorter));
    } catch {
      // silently fail if still too large
    }
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function extractPlayerName(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  return withoutExt.replace(/[_\-]/g, " ").replace(/\s+/g, " ").trim();
}

export async function createThumbnail(src: string, maxWidth = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("no canvas context")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
