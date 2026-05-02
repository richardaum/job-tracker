import { Alert } from "@job-tracker/ui";
import type { JSX } from "react";
import { useMemo } from "react";

import { getWebAppLaunchUrl } from "@/extension-channel/api-url";
import type { ExtensionChannelState } from "@/extension-channel/channel-state";
import { openOrFocusJobTrackerWebApp } from "@/extension-channel/open-job-tracker-web-app";
import { cn } from "@/lib/cn";

type ApiConnectivityIssueMessageProps = {
  channel: ExtensionChannelState | undefined;
};

/**
 * Inline message when the API connection fails or authentication is required.
 */
export function ApiConnectivityIssueMessage({
  channel,
}: ApiConnectivityIssueMessageProps): JSX.Element | null {
  const webLaunchUrl = useMemo(() => getWebAppLaunchUrl(), []);

  if (
    channel == null ||
    (channel.status !== "error" && channel.status !== "auth_required")
  ) {
    return null;
  }

  const isAuth = channel.status === "auth_required";

  if (isAuth) {
    return (
      <Alert
        intent="warning"
        className={cn(
          "px-3 py-2 shadow-none [&_span:first-child]:pt-0 [&_svg]:size-[18px]",
        )}
      >
        <span className={cn("block text-xs leading-snug")}>
          <a
            href={webLaunchUrl}
            className={cn(
              "font-medium text-inherit underline decoration-neutral-700/55 underline-offset-2 hover:opacity-90",
            )}
            onClick={(e) => {
              e.preventDefault();
              void openOrFocusJobTrackerWebApp();
            }}
          >
            Sign in
          </a>
          {" to Job Tracker in this browser."}
        </span>
      </Alert>
    );
  }

  const trimmed = channel.lastError?.trim();
  const text =
    trimmed != null && trimmed.length > 0
      ? trimmed
      : "Could not connect to the server.";

  return (
    <Alert
      intent="error"
      className={cn(
        "px-3 py-2 shadow-none [&_span:first-child]:pt-0 [&_svg]:size-[18px]",
      )}
    >
      <span className={cn("block text-xs leading-snug")}>{text}</span>
    </Alert>
  );
}
