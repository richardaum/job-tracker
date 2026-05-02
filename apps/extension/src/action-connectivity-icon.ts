import {
  type ExtensionChannelState,
  readChannelState,
} from "./extension-channel/channel-state";
import { EXTENSION_CHANNEL_STORAGE_KEY } from "./extension-channel/constants";

const CONNECTED_FILL = "#10b981";
const DISCONNECTED_FILL = "#ef4444";

function defaultIconPathsBySize(): Record<string, string> | undefined {
  const m = chrome.runtime.getManifest() as chrome.runtime.ManifestV3;
  const icon = m.action?.default_icon;
  if (icon != null && typeof icon === "object" && !Array.isArray(icon)) {
    return icon as Record<string, string>;
  }
  return m.icons as Record<string, string> | undefined;
}

function pickLargestIconPath(
  bySize: Record<string, string> | undefined,
): string | undefined {
  if (bySize == null) {
    return undefined;
  }
  let best: { n: number; path: string } | undefined;
  for (const [k, path] of Object.entries(bySize)) {
    const n = Number(k);
    if (!Number.isFinite(n) || path.length === 0) {
      continue;
    }
    if (best == null || n > best.n) {
      best = { n, path };
    }
  }
  return best?.path;
}

function isConnected(state: ExtensionChannelState | undefined): boolean {
  return state?.status === "streaming";
}

async function loadSourceIconBitmap(): Promise<ImageBitmap | undefined> {
  const path = pickLargestIconPath(defaultIconPathsBySize());
  if (path == null) {
    return undefined;
  }
  const url = chrome.runtime.getURL(path);
  const res = await fetch(url);
  if (!res.ok) {
    return undefined;
  }
  const blob = await res.blob();
  return createImageBitmap(blob);
}

function renderSize(
  source: ImageBitmap,
  outSize: number,
  fill: string,
): ImageData {
  const canvas = new OffscreenCanvas(outSize, outSize);
  const ctx = canvas.getContext("2d");
  if (ctx == null) {
    throw new Error("2d context unavailable");
  }
  ctx.clearRect(0, 0, outSize, outSize);
  ctx.drawImage(source, 0, 0, outSize, outSize);

  const r = Math.max(2, Math.round(outSize * 0.2));
  const pad = Math.max(1, Math.round(outSize * 0.09));
  const cx = outSize - pad - r;
  const cy = outSize - pad - r;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = Math.max(1, Math.round(outSize / 14));
  ctx.stroke();

  return ctx.getImageData(0, 0, outSize, outSize);
}

/**
 * Toolbar action icon with a bottom-right status dot (green = SSE streaming, red = otherwise).
 */
export async function applyActionConnectivityIcon(
  state: ExtensionChannelState | undefined,
): Promise<void> {
  const fill = isConnected(state) ? CONNECTED_FILL : DISCONNECTED_FILL;
  let source: ImageBitmap | undefined;
  try {
    source = await loadSourceIconBitmap();
  } catch {
    source = undefined;
  }
  if (source == null) {
    return;
  }
  try {
    const imageData: Record<number, ImageData> = {
      16: renderSize(source, 16, fill),
      32: renderSize(source, 32, fill),
    };
    await chrome.action.setIcon({ imageData });
  } finally {
    source.close();
  }
}

export function watchActionConnectivityIcon(): void {
  void readChannelState().then(applyActionConnectivityIcon);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") {
      return;
    }
    const ch = changes[EXTENSION_CHANNEL_STORAGE_KEY];
    if (ch?.newValue != null) {
      void applyActionConnectivityIcon(ch.newValue as ExtensionChannelState);
      return;
    }
    /** Key removed — treat as disconnected. */
    if (ch?.newValue === undefined && ch?.oldValue != null) {
      void applyActionConnectivityIcon(undefined);
    }
  });
}
