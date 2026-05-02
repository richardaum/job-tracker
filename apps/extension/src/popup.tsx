import "./globals.css";

import { Badge, Button, Heading, Stack, Text } from "@job-tracker/ui";
import type { JSX } from "react";
import { useEffect } from "react";

import { ApiConnectivityDot } from "@/components/api-connectivity/ApiConnectivityDot";
import { ApiConnectivityIssueMessage } from "@/components/api-connectivity/ApiConnectivityIssueMessage";
import { reconnectExtensionChannel } from "@/components/api-connectivity/reconnect-extension-channel";
import { useExtensionChannelState } from "@/extension-channel/use-extension-channel-state";
import { useImportQueueUiState } from "@/import-runs/use-import-queue-ui-state";
import { cn } from "@/lib/cn";
import { useMappingWizardPanelToggle } from "@/side-panel-mapping-wizard/use-mapping-wizard-panel-toggle";

/** Toolbar popup — extension identity version string and mapping wizard toggle. */
function IndexPopup(): JSX.Element {
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
  } = useMappingWizardPanelToggle({ initialSidePanelOpen: false });

  const apiChannel = useExtensionChannelState();
  const importQueue = useImportQueueUiState();

  return (
    <main
      className={cn(
        "box-border m-0 w-80 p-3 font-sans",
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

export default IndexPopup;
