"use client";

import { Card, cn, Heading, Stack, Text } from "@job-tracker/ui";

import type { ExtensionConnectionState } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import { connectionDetailValue } from "@/modules/admin/extension/lib/extension-connection.display";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";

type ExtensionConnectionDetailsCardProps = {
  connection: ExtensionConnectionState;
};

export function ExtensionConnectionDetailsCard({
  connection,
}: ExtensionConnectionDetailsCardProps) {
  return (
    <Card padding="md" className={cn("min-w-0 max-w-xl")}>
      <Stack gap="md">
        <Heading as="h2" size="lg">
          Connection details
        </Heading>
        <Stack gap="sm">
          <DetailRow
            label="Extension version"
            value={connectionDetailValue(
              connection.status,
              connection.extensionVersion,
            )}
          />
          <DetailRow
            label="Browser"
            value={connectionDetailValue(connection.status, connection.browser)}
          />
          <DetailRow
            label="Last checked"
            value={connectionDetailValue(
              connection.status,
              connection.lastHeartbeatAt
                ? formatDateTime(connection.lastHeartbeatAt)
                : null,
            )}
          />
          <DetailRow
            label="Web app origin"
            value={connection.webAppOrigin ?? "—"}
          />
        </Stack>
      </Stack>
    </Card>
  );
}

type DetailRowProps = { label: string; value: string };
function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div
      className={cn("grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3")}
    >
      <Text size="sm" color="secondary">
        {label}
      </Text>
      <Text size="sm" className={cn("min-w-0 break-all")}>
        {value}
      </Text>
    </div>
  );
}
