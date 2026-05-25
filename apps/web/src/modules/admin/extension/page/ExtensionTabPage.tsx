"use client";

import {
  Badge,
  Button,
  Card,
  cn,
  Heading,
  Stack,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  type TextColor,
} from "@job-tracker/ui";
import {
  ArrowClockwiseIcon,
  PulseIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { ExtensionConnectionDetailsCard } from "@/modules/admin/extension/components/ExtensionConnectionDetailsCard";
import { ExtensionConnectionMetricCard } from "@/modules/admin/extension/components/ExtensionConnectionMetricCard";
import { useExtensionConnectionStatus } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import {
  authDisplayLabel,
  authTextColor,
} from "@/modules/admin/extension/lib/extension-auth.display";
import {
  AdminHeaderActions,
  AdminSubTabs,
} from "@/modules/admin/layout/admin-header.slots";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";

type ExtensionEventStatus = "processing" | "completed" | "failed" | "queued";
type ExtensionSubTab = "status" | "events";

type ExtensionEvent = {
  id: string;
  type: string;
  status: ExtensionEventStatus;
  occurredAt: string;
  summary: string;
};

const MOCK_EXTENSION_EVENTS = buildMockExtensionEvents();

// mocked — synthetic feed rows for scroll preview; remove when wired to live data
function buildMockExtensionEvents(): ExtensionEvent[] {
  const seed: ExtensionEvent[] = [
    {
      id: "evt-001",
      type: "SOURCE_RUN_CREATED",
      status: "processing",
      occurredAt: new Date(Date.now() - 4_000).toISOString(),
      summary: "RemoteYeah · Senior Frontend Engineer",
    },
    {
      id: "evt-002",
      type: "IMPORT_JOB",
      status: "queued",
      occurredAt: new Date(Date.now() - 18_000).toISOString(),
      summary: "LinkedIn · Staff Software Engineer",
    },
    {
      id: "evt-003",
      type: "SOURCE_RUN_CREATED",
      status: "completed",
      occurredAt: new Date(Date.now() - 95_000).toISOString(),
      summary: "We Work Remotely · Full Stack Developer",
    },
    {
      id: "evt-004",
      type: "AUTH_REFRESH",
      status: "completed",
      occurredAt: new Date(Date.now() - 240_000).toISOString(),
      summary: "Session token refreshed",
    },
    {
      id: "evt-005",
      type: "SOURCE_RUN_CREATED",
      status: "failed",
      occurredAt: new Date(Date.now() - 420_000).toISOString(),
      summary: "Greenhouse · Platform Engineer — surface URL unavailable",
    },
  ];

  const types = ["SOURCE_RUN_CREATED", "IMPORT_JOB", "AUTH_REFRESH"] as const;
  const statuses: ExtensionEventStatus[] = [
    "processing",
    "queued",
    "completed",
    "failed",
  ];
  const summaries = [
    "RemoteYeah · Backend Engineer",
    "LinkedIn · Principal Engineer",
    "Lever · Product Designer",
    "Ashby · Engineering Manager",
    "Workday · Site Reliability Engineer",
    "Indeed · Data Engineer",
    "Glassdoor · Mobile Developer",
    "Wellfound · Founding Engineer",
    "Dice · Cloud Architect",
    "Builtin · DevOps Engineer",
  ];

  const extra = Array.from({ length: 20 }, (_, index) => {
    const offsetMs = 480_000 + index * 47_000;
    const type = types[index % types.length]!;
    const status = statuses[index % statuses.length]!;

    return {
      id: `evt-extra-${String(index + 1).padStart(3, "0")}`,
      type,
      status,
      occurredAt: new Date(Date.now() - offsetMs).toISOString(),
      summary:
        type === "AUTH_REFRESH"
          ? "Session token refreshed"
          : summaries[index % summaries.length]!,
    } satisfies ExtensionEvent;
  });

  return [...seed, ...extra];
}

const extensionSubTabTriggerClass = cn(
  "data-[state=active]:bg-bg-info-subtle data-[state=active]:text-text-brand",
);

function inFlightTextColor(count: number): TextColor {
  return count > 0 ? "brand" : "muted";
}

function eventStatusBadgeIntent(
  status: ExtensionEventStatus,
): React.ComponentProps<typeof Badge>["intent"] {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "processing":
      return "info";
    case "queued":
      return "warning";
  }
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

function countInFlightEvents(events: ExtensionEvent[]): number {
  return events.filter(
    (event) => event.status === "processing" || event.status === "queued",
  ).length;
}

function inFlightLabel(count: number): string {
  if (count === 0) return "Idle";
  if (count === 1) return "1 in flight";
  return `${count} in flight`;
}

function eventStatusLabel(status: ExtensionEventStatus): string {
  return status.replaceAll("_", " ");
}

function eventSummaryVisible(event: ExtensionEvent): boolean {
  if (event.type === "AUTH_REFRESH") return false;
  return event.summary.trim().length > 0;
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

function ExtensionEventRow({ event }: { event: ExtensionEvent }) {
  const showSummary = eventSummaryVisible(event);

  return (
    <li
      className={cn(
        "rounded-md border border-border-subtle bg-bg-field px-3 py-2.5",
      )}
    >
      <Stack gap={showSummary ? "xs" : undefined}>
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
              {event.type}
            </Text>
            <Badge intent={eventStatusBadgeIntent(event.status)}>
              {eventStatusLabel(event.status)}
            </Badge>
          </Stack>
          <Text
            size="xs"
            color="secondary"
            className={cn("shrink-0 tabular-nums")}
          >
            {formatDateTime(event.occurredAt)}
          </Text>
        </Stack>
        {showSummary ? (
          <Text size="sm" color="secondary" className={cn("min-w-0")}>
            {event.summary}
          </Text>
        ) : null}
      </Stack>
    </li>
  );
}

function ExtensionStatusPanel({
  connection,
  events,
}: {
  connection: ReturnType<typeof useExtensionConnectionStatus>;
  events: ExtensionEvent[];
}) {
  const inFlightCount = countInFlightEvents(events);

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
          <MetricValueText color={inFlightTextColor(inFlightCount)}>
            {inFlightLabel(inFlightCount)}
          </MetricValueText>
        </StatusMetricCard>
      </div>

      <ExtensionConnectionDetailsCard connection={connection} />
    </Stack>
  );
}

function ExtensionEventsPanel({ events }: { events: ExtensionEvent[] }) {
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
            Event processing
          </Heading>
          <Stack direction="row" gap="xs" align="center">
            <ArrowClockwiseIcon size={14} className={cn("text-text-muted")} />
            <Text size="xs" color="secondary">
              Live feed preview
            </Text>
          </Stack>
        </Stack>
        <ul className={cn("m-0 list-none flex flex-col gap-2 p-0")}>
          {events.map((event) => (
            <ExtensionEventRow key={event.id} event={event} />
          ))}
        </ul>
      </Stack>
    </Card>
  );
}

export default function ExtensionTabPage() {
  const connection = useExtensionConnectionStatus();
  const [extensionSubTab, setExtensionSubTab] =
    useState<ExtensionSubTab>("status");

  function refreshExtensionAdmin() {
    connection.retry();
  }

  return (
    <Stack gap="lg" align="stretch" className={cn("w-full min-w-0 px-1")}>
      <AdminHeaderActions>
        <Button
          type="button"
          intent="secondary"
          size="md"
          state={connection.status === "checking" ? "loading" : "default"}
          leftIcon={<ArrowClockwiseIcon size={16} weight="bold" />}
          onClick={refreshExtensionAdmin}
        >
          Refresh
        </Button>
      </AdminHeaderActions>

      <AdminSubTabs>
        <Tabs
          value={extensionSubTab}
          onValueChange={(value) =>
            setExtensionSubTab(value as ExtensionSubTab)
          }
        >
          <TabsList className={cn("border-border-brand/40")}>
            <TabsTrigger value="status" className={extensionSubTabTriggerClass}>
              Status
            </TabsTrigger>
            <TabsTrigger value="events" className={extensionSubTabTriggerClass}>
              Events
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </AdminSubTabs>

      {extensionSubTab === "status" ? (
        <ExtensionStatusPanel
          connection={connection}
          events={MOCK_EXTENSION_EVENTS}
        />
      ) : (
        <ExtensionEventsPanel events={MOCK_EXTENSION_EVENTS} />
      )}
    </Stack>
  );
}
