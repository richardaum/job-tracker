import { Tooltip } from "@job-tracker/ui";
import type { JSX } from "react";
import { useCallback, useMemo } from "react";

import type { ExtensionChannelState } from "@/extension-channel/channel-state";
import { cn } from "@/lib/cn";

import {
  connectivitySubtitle,
  connectivityTitle,
  DOT_CLASSES,
  DOT_SHOULD_PULSE,
  toneForState,
} from "./connectivity-indicator-shared";
import { reconnectExtensionChannel } from "./reconnect-extension-channel";

type ApiConnectivityDotProps = {
  channel: ExtensionChannelState | undefined;
  /** When false, only the dot+button is rendered (e.g. if a parent supplies its own overlay). */
  tooltipEnabled?: boolean;
  tooltipSide?: "top" | "right" | "bottom" | "left";
};

/**
 * Status dot next to the title (green / red / amber / gray).
 * Hover for details (tooltip); click attempts to reconnect the SSE channel.
 */
export function ApiConnectivityDot({
  channel,
  tooltipEnabled = true,
  tooltipSide = "bottom",
}: ApiConnectivityDotProps): JSX.Element {
  const tone = useMemo(() => toneForState(channel), [channel]);
  const title = useMemo(() => connectivityTitle(channel), [channel]);
  const subtitle = useMemo(() => connectivitySubtitle(channel), [channel]);

  const reconnect = useCallback(() => {
    reconnectExtensionChannel();
  }, []);

  const ariaSubtitle =
    subtitle != null && subtitle.length > 0 ? `${subtitle} ` : "";

  const tooltipBody =
    subtitle != null && subtitle.length > 0 ? (
      <div className={cn("max-w-[240px] text-left leading-snug")}>
        <div>{title}</div>
        <div className={cn("mt-0.5 text-neutral-300")}>{subtitle}</div>
      </div>
    ) : (
      title
    );

  return (
    <Tooltip content={tooltipBody} side={tooltipSide} enabled={tooltipEnabled}>
      <button
        type="button"
        className={cn(
          "-m-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400",
        )}
        aria-label={`API connection: ${title}. ${ariaSubtitle}Click to reconnect.`}
        onClick={reconnect}
      >
        <span
          className={cn(
            "relative inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white",
            DOT_CLASSES[tone],
            DOT_SHOULD_PULSE(tone) && "animate-pulse",
          )}
          aria-hidden
        />
      </button>
    </Tooltip>
  );
}
