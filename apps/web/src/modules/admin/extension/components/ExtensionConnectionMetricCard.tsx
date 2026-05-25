"use client";

import { Card, cn, Stack, Text, type TextColor } from "@job-tracker/ui";
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
};

export function ExtensionConnectionMetricCard({
  connection,
}: ExtensionConnectionMetricCardProps) {
  const hint = connectionSubtext(connection);

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
        <Stack gap="xs" align="start" className={cn("min-w-0 w-full")}>
          <ConnectionMetricValue color={connectionTextColor(connection.status)}>
            {connectionLabel(connection.status)}
          </ConnectionMetricValue>
          {hint ? (
            <Text size="xs" color="muted">
              {hint}
            </Text>
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
