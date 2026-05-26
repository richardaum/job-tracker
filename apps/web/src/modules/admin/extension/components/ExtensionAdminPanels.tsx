"use client";

import {
  Badge,
  Card,
  cn,
  Heading,
  Stack,
  Text,
  type TextColor,
} from "@job-tracker/ui";
import {
  ArrowClockwiseIcon,
  PulseIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";

import { ExtensionConnectionDetailsCard } from "@/modules/admin/extension/components/ExtensionConnectionDetailsCard";
import { ExtensionConnectionMetricCard } from "@/modules/admin/extension/components/ExtensionConnectionMetricCard";
import type { useExtensionConnectionStatus } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import {
  authDisplayLabel,
  authTextColor,
} from "@/modules/admin/extension/lib/extension-auth.display";
import {
  activityEventBadgeIntent,
  activityEventTypeLabel,
  adminEventSecondaryBadge,
  adminEventTypeLabel,
  type ExtensionAdminEvent,
  inFlightLabel,
} from "@/modules/admin/extension/lib/extension-events.display";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";

function inFlightTextColor(count: number): TextColor {
  return count > 0 ? "brand" : "muted";
}

function MetricValueText({
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

function StatusMetricCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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
            {label}
          </Text>
          <span className={cn("text-text-muted")}>{icon}</span>
        </Stack>
        <Stack gap="xs" align="start">
          {children}
        </Stack>
      </Stack>
    </Card>
  );
}

function ExtensionEventRow({ event }: { event: ExtensionAdminEvent }) {
  const secondaryBadge = adminEventSecondaryBadge(event);

  return (
    <li
      className={cn(
        "rounded-md border border-border-subtle bg-bg-field px-3 py-2.5",
      )}
    >
      <Stack gap="xs">
        <Stack
          direction="row"
          gap="sm"
          align="center"
          justify="between"
          className={cn("w-full min-w-0 gap-3")}
        >
          <Stack
            direction="row"
            gap="sm"
            align="center"
            className={cn("min-w-0 flex-1")}
          >
            <Text
              size="sm"
              weight="medium"
              className={cn("shrink-0 font-mono uppercase")}
            >
              {adminEventTypeLabel(event)}
            </Text>
            {secondaryBadge ? (
              <Badge intent={secondaryBadge.intent}>
                {secondaryBadge.label}
              </Badge>
            ) : event.kind === "activity" ? (
              <Badge intent={activityEventBadgeIntent(event.type)}>
                {activityEventTypeLabel(event.type)}
              </Badge>
            ) : null}
          </Stack>
          <Text
            size="xs"
            color="secondary"
            className={cn("shrink-0 tabular-nums")}
          >
            {formatDateTime(event.occurredAt)}
          </Text>
        </Stack>
        <Text size="sm" color="secondary" className={cn("min-w-0")}>
          {event.summary}
        </Text>
      </Stack>
    </li>
  );
}

export function ExtensionStatusPanel({
  connection,
  inFlightCount,
  eventsLoading,
}: {
  connection: ReturnType<typeof useExtensionConnectionStatus>;
  inFlightCount: number;
  eventsLoading: boolean;
}) {
  return (
    <Stack gap="lg" align="stretch" className={cn("w-full min-w-0")}>
      <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3")}>
        <ExtensionConnectionMetricCard connection={connection} />

        <StatusMetricCard
          label="Authentication"
          icon={<ShieldCheckIcon size={18} weight="duotone" />}
        >
          <MetricValueText color={authTextColor(connection)}>
            {authDisplayLabel(connection)}
          </MetricValueText>
        </StatusMetricCard>

        <StatusMetricCard
          label="Active events"
          icon={<PulseIcon size={18} weight="duotone" />}
        >
          <MetricValueText
            color={
              eventsLoading ? "secondary" : inFlightTextColor(inFlightCount)
            }
          >
            {eventsLoading ? "Loading…" : inFlightLabel(inFlightCount)}
          </MetricValueText>
        </StatusMetricCard>
      </div>

      <ExtensionConnectionDetailsCard connection={connection} />
    </Stack>
  );
}

export function ExtensionEventsPanel({
  events,
  loading,
  error,
}: {
  events: ExtensionAdminEvent[];
  loading: boolean;
  error: unknown;
}) {
  return (
    <Card padding="md" className={cn("min-w-0")}>
      <Stack gap="md">
        <Stack
          direction="row"
          gap="sm"
          align="center"
          justify="between"
          className={cn("w-full")}
        >
          <Heading as="h2" size="lg">
            Extension activity
          </Heading>
          <Stack direction="row" gap="xs" align="center">
            <ArrowClockwiseIcon size={14} className={cn("text-text-muted")} />
            <Text size="xs" color="secondary">
              Live updates
            </Text>
          </Stack>
        </Stack>

        {loading ? (
          <Text size="sm" color="secondary">
            Loading events…
          </Text>
        ) : null}

        {error ? (
          <Text size="sm" color="secondary">
            Could not load extension events.
          </Text>
        ) : null}

        {!loading && !error && events.length === 0 ? (
          <Text size="sm" color="secondary">
            No extension events yet.
          </Text>
        ) : null}

        {events.length > 0 ? (
          <ul className={cn("m-0 list-none flex flex-col gap-2 p-0")}>
            {events.map((event) => (
              <ExtensionEventRow key={event.id} event={event} />
            ))}
          </ul>
        ) : null}
      </Stack>
    </Card>
  );
}
