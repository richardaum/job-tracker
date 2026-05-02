import "./globals.css";

import { Badge, Button, Heading, Stack, Text } from "@job-tracker/ui";
import type { JSX } from "react";
import { useEffect } from "react";

import { ApiConnectivityDot } from "@/components/api-connectivity/ApiConnectivityDot";
import { ApiConnectivityIssueMessage } from "@/components/api-connectivity/ApiConnectivityIssueMessage";
import { reconnectExtensionChannel } from "@/components/api-connectivity/reconnect-extension-channel";
import { clearExtensionChannelSseLog } from "@/extension-channel/sse-event-log";
import { useExtensionChannelSseLog } from "@/extension-channel/use-extension-channel-sse-log";
import { useExtensionChannelState } from "@/extension-channel/use-extension-channel-state";
import { useImportQueueUiState } from "@/import-runs/use-import-queue-ui-state";
import { cn } from "@/lib/cn";
import { useMappingWizardPanelToggle } from "@/side-panel-mapping-wizard/use-mapping-wizard-panel-toggle";

/** Side panel UI — mirrored from toolbar popup (`popup.tsx`). */
function SidePanel(): JSX.Element {
  const manifest = chrome.runtime.getManifest();

  const title = manifest?.name ?? "@job-tracker/extension";
  const version = manifest?.version ?? "0.0.0";

  useEffect(() => {
    reconnectExtensionChannel();
  }, []);

  const {
    openError,
    sidePanelOpen,
    canToggleClose,
    panelPressed,
    toggleMappingWizardPanel,
  } = useMappingWizardPanelToggle({ initialSidePanelOpen: true });

  const apiChannel = useExtensionChannelState();
  const importQueue = useImportQueueUiState();
  const { entries: sseLog, hasStoredEntries } = useExtensionChannelSseLog();

  return (
    <main
      className={cn(
        "box-border m-0 w-full max-w-sm min-w-80 p-3 font-sans",
        "overscroll-contain text-text-primary antialiased",
      )}
    >
      <Stack align="stretch" direction="column" gap="sm">
        <Heading
          as="h1"
          size="base"
          className={cn("font-semibold leading-tight")}
        >
          <Stack
            align="center"
            className={cn("w-full")}
            direction="row"
            gap="xs"
          >
            <ApiConnectivityDot channel={apiChannel} />
            <Stack
              align="center"
              className={cn("min-w-0 flex-1")}
              direction="row"
              gap="xs"
            >
              <Text
                as="span"
                size="base"
                weight="semibold"
                className={cn("min-w-0 truncate")}
              >
                {title}
              </Text>
              <Badge
                className={cn("shrink-0 text-[13px]")}
              >{`v${version}`}</Badge>
            </Stack>
          </Stack>
        </Heading>
        <Text
          as="p"
          size="xs"
          color="muted"
          aria-live="polite"
          className={cn("tabular-nums leading-snug tracking-tight")}
        >
          Import queue · {importQueue.queuedCount} waiting ·{" "}
          {importQueue.processorStatus === "busy" ? "Busy" : "Idle"}
        </Text>
        <ApiConnectivityIssueMessage channel={apiChannel} />
        <Stack align="stretch" direction="column" gap="xs">
          <Stack
            align="center"
            className={cn("w-full")}
            direction="row"
            gap="xs"
            justify="between"
          >
            <Text
              as="p"
              size="xs"
              weight="semibold"
              className={cn("m-0 tracking-tight text-text-secondary")}
            >
              SSE log
            </Text>
            <Button
              type="button"
              intent="secondary"
              size="sm"
              disabled={!hasStoredEntries}
              className={cn("shrink-0 text-[12px]")}
              onClick={() => {
                void clearExtensionChannelSseLog();
              }}
            >
              Clear log
            </Button>
          </Stack>
          <div
            className={cn(
              "max-h-44 overflow-y-auto rounded border border-default bg-bg-surface p-2",
            )}
            role="region"
            aria-label="Recent SSE subscription payloads"
          >
            {sseLog.length === 0 ? (
              <Text as="p" size="xs" color="muted" className={cn("m-0")}>
                {hasStoredEntries
                  ? "Only heartbeat payloads in the log right now (hidden). Non-heartbeat channel events will appear here."
                  : "No payloads yet — connect and wait for extension channel events."}
              </Text>
            ) : (
              <ul className={cn("m-0 list-none space-y-2.5 p-0")}>
                {sseLog.map((e, i) => (
                  <li
                    key={`${e.receivedAt}-${i}-${e.kind}`}
                    className={cn("min-w-0")}
                  >
                    <Text
                      as="span"
                      size="xs"
                      color="muted"
                      className={cn("font-mono tabular-nums")}
                    >
                      {new Date(e.receivedAt).toLocaleTimeString(undefined, {
                        hour12: false,
                        fractionalSecondDigits: 3,
                      })}
                    </Text>{" "}
                    <Text as="span" size="xs" weight="semibold">
                      {e.kind}
                    </Text>
                    {e.payloadSnippet.length > 0 ? (
                      <pre
                        className={cn(
                          "mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-all",
                          "m-0 font-mono text-[11px] leading-snug text-text-muted",
                        )}
                      >
                        {e.payloadSnippet}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Stack>
        <Button
          aria-pressed={panelPressed}
          className={cn(
            "w-full text-[13px]",
            panelPressed && "border-border-strong bg-bg-surface-hover",
          )}
          intent="secondary"
          size="sm"
          onClick={toggleMappingWizardPanel}
        >
          {canToggleClose && sidePanelOpen
            ? "Hide mapping wizard"
            : "Show mapping wizard"}
        </Button>
        {openError != null && openError.length > 0 ? (
          <Text as="p" size="xs" color="error" role="status">
            {openError}
          </Text>
        ) : null}
      </Stack>
    </main>
  );
}

export default SidePanel;
