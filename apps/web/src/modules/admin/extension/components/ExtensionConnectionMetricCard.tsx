"use client";

import { Button, Card, cn, Stack, Text, type TextColor } from "@job-tracker/ui";
import {
  ArrowClockwiseIcon,
  PlugsConnectedIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import type { ExtensionConnectionState } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import {
  connectionLabel,
  connectionSubtext,
  connectionTextColor,
} from "@/modules/admin/extension/lib/extension-connection.display";

type ExtensionConnectionMetricCardProps = {
  connection: ExtensionConnectionState;
  onRetry: () => void;
};

export function ExtensionConnectionMetricCard({
  connection,
  onRetry,
}: ExtensionConnectionMetricCardProps) {
  const hint = connectionSubtext(connection.status);
  const showRetry = connection.status !== "connected";

  return (
    <Card padding="md" className={cn("min-w-0 flex-1")}>
      <Stack gap="sm">
        <Stack
          direction="row"
          gap="sm"
          align="center"
          justify="between"
          className={cn("w-full")}
        >
          <Text size="sm" color="secondary">
            Connection
          </Text>
          <span className={cn("text-text-muted")}>
            {connectionIcon(connection.status)}
          </span>
        </Stack>
        <Stack
          direction="row"
          gap="sm"
          align="center"
          justify="between"
          className={cn("w-full min-w-0")}
        >
          <Stack gap="xs" align="start" className={cn("min-w-0 flex-1")}>
            <ConnectionMetricValue
              color={connectionTextColor(connection.status)}
            >
              {connectionLabel(connection.status)}
            </ConnectionMetricValue>
            {hint ? (
              <Text size="xs" color="secondary">
                {hint}
              </Text>
            ) : null}
          </Stack>
          {showRetry ? (
            <Button
              type="button"
              size="sm"
              intent="secondary"
              state={connection.status === "checking" ? "loading" : "default"}
              leftIcon={<ArrowClockwiseIcon size={14} weight="bold" />}
              className={cn("shrink-0")}
              onClick={onRetry}
            >
              Retry
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
}

function ConnectionMetricValue({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: TextColor;
}) {
  return (
    <Text
      size="lg"
      weight="medium"
      color={color}
      className={cn("min-w-0 break-all")}
    >
      {children}
    </Text>
  );
}

function connectionIcon(
  status: ExtensionConnectionState["status"],
): React.ReactNode {
  if (status === "connected") {
    return <PlugsConnectedIcon size={18} weight="duotone" />;
  }

  if (status === "checking") {
    return <ArrowClockwiseIcon size={18} weight="duotone" />;
  }

  return <WarningCircleIcon size={18} weight="duotone" />;
}
