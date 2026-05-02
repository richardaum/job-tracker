import type { ExtensionChannelState } from "@/extension-channel/channel-state";

export type IndicatorTone =
  | "unknown"
  | "connecting"
  | "connected"
  | "warning"
  | "error";

export function toneForState(
  channel: ExtensionChannelState | undefined,
): IndicatorTone {
  if (channel == null) {
    return "unknown";
  }
  switch (channel.status) {
    case "streaming":
      return "connected";
    case "connecting":
      return "connecting";
    case "auth_required":
      return "warning";
    case "error":
      return "error";
    default:
      return "unknown";
  }
}

export const DOT_CLASSES: Record<IndicatorTone, string> = {
  unknown: "bg-neutral-400",
  connecting: "bg-amber-400",
  connected: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.65)]",
  warning: "bg-amber-500",
  error: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
};

export const DOT_SHOULD_PULSE = (t: IndicatorTone) => t === "connecting";

export function connectivityTitle(
  channel: ExtensionChannelState | undefined,
): string {
  if (channel == null) {
    return "Checking API connection…";
  }
  switch (channel.status) {
    case "streaming":
      return "Connected to API";
    case "connecting":
      return "Connecting to API…";
    case "auth_required":
      return "Sign in required";
    case "error":
      return "API connection error";
    case "idle":
      return "API channel idle";
    default:
      return "Unknown state";
  }
}

export function connectivitySubtitle(
  channel: ExtensionChannelState | undefined,
): string | null {
  if (channel == null) {
    return null;
  }
  if (channel.status === "streaming" && channel.lastEventKind != null) {
    return `Last event: ${channel.lastEventKind}`;
  }
  if (channel.status === "error" || channel.status === "auth_required") {
    return channel.lastError ?? null;
  }
  return null;
}
